import type { NextApiRequest, NextApiResponse } from 'next';

// Enhanced proxy that fetches external content and serves it without frame-busting headers.
// Includes comprehensive URL rewriting, header removal, and fallback mechanisms.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = (req.query.url as string) || '';
  console.log('Proxy request for:', target);
  
  if (!target || !/^https?:\/\//i.test(target)) {
    console.error('Invalid URL:', target);
    res.status(400).send('Missing or invalid url param');
    return;
  }

  // Normalize target for better iframe compatibility
  let normalizedTarget = target;
  try {
    const u = new URL(target);
    
    // Add Google-specific parameters for better iframe compatibility
    if (/(^|\.)google\.(com|ca|co\.[a-z]{2}|[a-z]{2})$/i.test(u.hostname)) {
      if (!u.searchParams.has('igu')) {
        u.searchParams.set('igu', '1');
      }
      if (!u.searchParams.has('hl')) {
        u.searchParams.set('hl', 'en');
      }
      // Use webhp for better iframe compatibility
      if (u.pathname === '/' || u.pathname === '') {
        u.pathname = '/webhp';
      }
      normalizedTarget = u.toString();
    }
    
    // Add GitHub-specific parameters for better compatibility
    if (u.hostname === 'github.com' || u.hostname.endsWith('.github.com')) {
      if (!u.searchParams.has('embed')) {
        u.searchParams.set('embed', '1');
      }
    }
  } catch {
    // ignore URL parsing errors
  }

  // List of user agents for better compatibility
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  ];

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  // Retry mechanism with different approaches
  let upstream;
  let lastError;
  
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`Proxy attempt ${attempt + 1} for:`, normalizedTarget);
      
      // Try different approaches for each attempt
      let headers: any = {
        'User-Agent': userAgents[attempt % userAgents.length],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      };
      
      // Add more headers for first attempt, fewer for fallbacks
      if (attempt === 0) {
        headers = {
          ...headers,
          'Accept-Encoding': 'gzip, deflate, br',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
          'DNT': '1'
        };
      } else if (attempt === 1) {
        // Minimal headers for second attempt
        headers = {
          'User-Agent': headers['User-Agent'],
          'Accept': '*/*'
        };
      }
      
      upstream = await fetch(normalizedTarget, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (upstream.ok) {
        console.log(`Proxy attempt ${attempt + 1} successful`);
        break;
      } else {
        throw new Error(`HTTP ${upstream.status}: ${upstream.statusText}`);
      }
    } catch (error) {
      lastError = error;
      console.warn(`Proxy attempt ${attempt + 1} failed:`, error);
      
      if (attempt < 2) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  if (!upstream || !upstream.ok) {
    throw lastError || new Error('All proxy attempts failed');
  }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    
    // Set response headers for iframe compatibility
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Remove all restrictive headers that prevent iframe embedding
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('Referrer-Policy');
    
    // Set permissive headers for iframe embedding
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    console.log('Proxy response headers set for iframe compatibility');

    if (contentType.includes('text/html')) {
      let html = await upstream.text();

      // Handle empty or malformed HTML
      if (!html || html.trim().length === 0) {
        html = `<html><head><title>Empty Response</title></head><body><h1>Empty Response</h1><p>The server returned an empty response.</p></body></html>`;
      }
      
      // Basic security: remove potentially dangerous scripts
      html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      html = html.replace(/<script[^>]*\/?>/gi, '');
      
      // Remove any existing CSP or frame-busting meta tags
      html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]+http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]+http-equiv=["']?referrer-policy["']?[^>]*>/gi, '');

      // Get base URL for relative URL resolution
      const urlObj = new URL(normalizedTarget);
      const baseHref = urlObj.origin + (urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname.replace(/[^/]*$/, ''));

      // Enhanced injection script for comprehensive URL rewriting
      const headNavScript = `
        <script>
        (function(){
          try{
            var PROXY_PATH='${'/api/proxy?url='}';
            var BASE='${baseHref}';
            var TARGET_URL='${normalizedTarget}';
            
            function toProxy(u){ 
              try{ 
                if (u.startsWith(PROXY_PATH)) return u;
                var absolute = new URL(u, BASE).toString();
                return PROXY_PATH + encodeURIComponent(absolute); 
              } catch(_) { 
                return u; 
              } 
            }
            
            // Override window.open
            var origOpen = window.open;
            window.open = function(url, name, specs){ 
              if(url){ 
                try{ 
                  var proxied = toProxy(url);
                  if (name === '_blank' || name === '_top') {
                    window.parent.postMessage({type: 'navigate', url: proxied}, '*');
                  } else {
                    window.location.href = proxied; 
                  }
                  return null; 
                } catch(_){} 
              } 
              return origOpen && origOpen.apply(window, arguments); 
            };
            
            // Override history methods
            ['pushState','replaceState'].forEach(function(m){ 
              try{ 
                var o = history[m]; 
                history[m] = function(s,t,u){ 
                  if(u){ 
                    try{ 
                      window.location.href = toProxy(u); 
                      return; 
                    } catch(_){} 
                  } 
                  return o.apply(history, arguments); 
                }; 
              } catch(_){}
            });
            
            console.log('Proxy navigation handlers injected for:', TARGET_URL);
          } catch(e){ 
            console.error('Proxy injection failed:', e);
          }
        })();
        </script>`;

      // Inject base and script into head
      if (html.includes('<head')) {
        html = html.replace(/<head(\b[^>]*)>/i, (m, attrs) => `
          <head${attrs}>
          <base href="${baseHref}" />
          <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; media-src * data: blob:; frame-ancestors *; connect-src * data: blob:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:;">
          ${headNavScript}
        `);
      } else {
        // Fallback: inject at the beginning of the document
        html = headNavScript + html;
      }

      // Strip existing security headers from HTML content
      html = html.replace(/<meta[^>]+http-equiv=["']?content-security-policy["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]+http-equiv=["']?x-frame-options["']?[^>]*>/gi, '');
      html = html.replace(/<meta[^>]+http-equiv=["']?referrer-policy["']?[^>]*>/gi, '');

      // Enhanced link and form rewriting
      const proxyOrigin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
      const proxyPath = '/api/proxy?url=';
      const safe = (u: string) => {
        try {
          return proxyPath + encodeURIComponent(new URL(u, baseHref).toString());
        } catch {
          return u;
        }
      };

      // Ensure Google links keep igu=1 for embed-friendly behavior
      const withGoogleIgu = (absUrl: string) => {
        try {
          const u = new URL(absUrl);
          if (/(^|\.)google\.(com|ca|co\.[a-z]{2}|[a-z]{2})$/i.test(u.hostname) && !u.searchParams.has('igu')) {
            u.searchParams.set('igu', '1');
            return u.toString();
          }
        } catch {}
        return absUrl;
      };

      // Replace anchor hrefs (comprehensive)
      html = html.replace(/<a\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (m, pre, href, post) => {
        if (/^\s*javascript:|^mailto:|^tel:|^#/i.test(href)) return m;
        try {
          const abs = withGoogleIgu(new URL(href, baseHref).toString());
          return `<a ${pre}href="${safe(abs)}"${post}>`;
        } catch {
          return m;
        }
      });

      // Replace form actions
      html = html.replace(/<form\s+([^>]*?)action=["']([^"']+)["']([^>]*)>/gi, (m, pre, action, post) => {
        if (/^\s*javascript:/i.test(action)) return m;
        try {
          const abs = withGoogleIgu(new URL(action, baseHref).toString());
          return `<form ${pre}action="${safe(abs)}"${post}>`;
        } catch {
          return m;
        }
      });

      // Rewrite iframe and frame sources
      html = html.replace(/<(iframe|frame)\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, tag, pre, src, post) => {
        try {
          const abs = withGoogleIgu(new URL(src, baseHref).toString());
          return `<${tag} ${pre}src="${safe(abs)}"${post}>`;
        } catch {
          return m;
        }
      });

      // Rewrite object/embed data/src attributes
      html = html.replace(/<object\s+([^>]*?)data=["']([^"']+)["']([^>]*)>/gi, (m, pre, data, post) => {
        try {
          const abs = new URL(data, baseHref).toString();
          return `<object ${pre}data="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      html = html.replace(/<embed\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        try {
          const abs = new URL(src, baseHref).toString();
          return `<embed ${pre}src="${safe(abs)}"${post}>`;
        } catch { return m; }
      });

      // Rewrite meta refresh URLs
      html = html.replace(/<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']\s*\d+\s*;\s*url=([^"']+)["'][^>]*>/gi, (m, url) => {
        try {
          const abs = withGoogleIgu(new URL(url, baseHref).toString());
          const proxied = safe(abs);
          return m.replace(url, proxied);
        } catch { return m; }
      });

      // Enhanced client-side navigation interceptor
      const clientSideScript = `
        <script>
        (function(){
          try {
            var PROXY_PATH = '${proxyPath}';
            var BASE = '${baseHref}';
            var TARGET_URL = '${normalizedTarget}';
            
            function toProxy(u){
              try { 
                if (u.startsWith(PROXY_PATH)) return u;
                return PROXY_PATH + encodeURIComponent(new URL(u, BASE).toString()); 
              } catch(_) { 
                return u; 
              }
            }

            // Enhanced click handler
            document.addEventListener('click', function(e){
              try {
                var a = e.target.closest && e.target.closest('a[href]');
                if (!a) return;
                var href = a.getAttribute('href');
                if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
                if (!href.startsWith(PROXY_PATH)) {
                  e.preventDefault();
                  e.stopPropagation();
                  var proxied = toProxy(href);
                  console.log('Navigating via proxy to:', href, '->', proxied);
                  window.location.href = proxied;
                }
              } catch(err) {
                console.error('Click handler error:', err);
              }
            }, true);

            // Enhanced form submit handler
            document.addEventListener('submit', function(e){
              try {
                var form = e.target;
                var action = form.getAttribute('action') || window.location.href;
                if (!action.startsWith(PROXY_PATH)) {
                  var proxied = toProxy(action);
                  form.setAttribute('action', proxied);
                  console.log('Form action proxied:', action, '->', proxied);
                }
              } catch(err) {
                console.error('Form submit handler error:', err);
              }
            }, true);

            // Enhanced window.open override
            try {
              var origOpen = window.open;
              window.open = function(url, name, specs){
                try {
                  if (url && !url.startsWith(PROXY_PATH)) {
                    var proxied = toProxy(url);
                    console.log('window.open proxied:', url, '->', proxied);
                    if (name === '_blank' || name === '_top') {
                      window.parent.postMessage({type: 'navigate', url: proxied}, '*');
                    } else {
                      window.location.href = proxied;
                    }
                    return null;
                  }
                } catch(err) {
                  console.error('window.open override error:', err);
                }
                return origOpen && origOpen.apply(window, arguments);
              };
            } catch(err) {
              console.error('window.open override setup error:', err);
            }

            // Enhanced History API patching
            try {
              function patchHistoryMethod(method){
                var orig = history[method];
                history[method] = function(state, title, url){
                  try {
                    if (url && !url.startsWith(PROXY_PATH)) {
                      var proxied = toProxy(url);
                      console.log('History API proxied:', url, '->', proxied);
                      window.location.href = proxied;
                      return;
                    }
                  } catch(err) {
                    console.error('History API error:', err);
                  }
                  return orig.apply(history, arguments);
                };
              }
              patchHistoryMethod('pushState');
              patchHistoryMethod('replaceState');
            } catch(err) {
              console.error('History API patching error:', err);
            }

            // Enhanced Location API patching
            try {
              var locProto = window.Location && window.Location.prototype;
              if (locProto) {
                ['assign','replace'].forEach(function(m){
                  var orig = locProto[m];
                  if (orig) {
                    locProto[m] = function(u){ 
                      try{ 
                        if (!u.startsWith(PROXY_PATH)) {
                          var proxied = toProxy(u);
                          console.log('Location.' + m + ' proxied:', u, '->', proxied);
                          return window.location.href = proxied; 
                        }
                      } catch(err) { 
                        console.error('Location.' + m + ' error:', err);
                      }
                      return orig.call(this, u); 
                    };
                  }
                });
                
                var desc = Object.getOwnPropertyDescriptor(locProto, 'href');
                if (desc && desc.set) {
                  Object.defineProperty(locProto, 'href', {
                    get: desc.get,
                    set: function(v){ 
                      try{ 
                        if (!v.startsWith(PROXY_PATH)) {
                          var proxied = toProxy(v);
                          console.log('Location.href setter proxied:', v, '->', proxied);
                          return window.location.href = proxied;
                        }
                      } catch(err) { 
                        console.error('Location.href setter error:', err);
                      }
                      return desc.set.call(this, v); 
                    }
                  });
                }
              }
            } catch(err) {
              console.error('Location API patching error:', err);
            }

            // Handle frame-busting attempts
            try {
              var originalTop = window.top;
              var originalParent = window.parent;
              var originalFrameElement = window.frameElement;
              
              Object.defineProperty(window, 'top', {
                get: function() { return window; },
                configurable: true
              });
              
              Object.defineProperty(window, 'parent', {
                get: function() { return window; },
                configurable: true
              });
              
              Object.defineProperty(window, 'frameElement', {
                get: function() { return null; },
                configurable: true
              });
              
              console.log('Frame-busting protection enabled');
            } catch(err) {
              console.error('Frame-busting protection error:', err);
            }

            console.log('Enhanced proxy handlers successfully initialized for:', TARGET_URL);
          } catch(err) {
            console.error('Global proxy initialization error:', err);
          }
        })();
        </script>
      `;

      // Inject the enhanced script before closing body tag, or at the end if no body tag
      if (html.includes('</body>')) {
        html = html.replace(/<\/body\s*>/i, clientSideScript + '</body>');
      } else {
        html = html + clientSideScript;
      }

      res.status(upstream.status).send(html);
      return;
    }

    // Non-HTML: just pass through bytes
    try {
      const buf = Buffer.from(await upstream.arrayBuffer());
      
      // Set appropriate headers for different content types
      if (contentType.includes('image/')) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache images
      } else if (contentType.includes('text/css') || contentType.includes('application/javascript')) {
        res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache CSS/JS
      }
      
      res.status(upstream.status).send(buf);
      console.log(`Successfully proxied ${contentType} content`);
    } catch (bufferError) {
      console.error('Buffer processing error:', bufferError);
      res.status(500).send('Failed to process non-HTML content');
    }
  } catch (err: any) {
    console.error('Proxy error for URL:', target, 'Error:', err);
    
    // Enhanced error response with fallback content
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .error-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .error-title { color: #d32f2f; margin-bottom: 16px; }
          .error-message { color: #666; margin-bottom: 16px; }
          .retry-button { background: #1976d2; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
          .retry-button:hover { background: #1565c0; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h2 class="error-title">Connection Failed</h2>
          <div class="error-message">
            <p>Unable to load: <strong>${target}</strong></p>
            <p>Error: ${err?.message || String(err)}</p>
            <p>This might be due to:</p>
            <ul>
              <li>The website blocking requests</li>
              <li>Network connectivity issues</li>
              <li>Server timeout</li>
              <li>Invalid SSL certificate</li>
            </ul>
          </div>
          <button class="retry-button" onclick="window.location.reload()">Retry</button>
          <button class="retry-button" onclick="window.parent.postMessage({type: 'navigate', url: '/api/proxy?url=' + encodeURIComponent('https://www.google.com/search?igu=1&q=' + encodeURIComponent('${target}'))}, '*')" style="margin-left: 8px;">Search Instead</button>
        </div>
      </body>
      </html>
    `;
    
    res.status(502).setHeader('Content-Type', 'text/html').send(errorHtml);
  }
}
