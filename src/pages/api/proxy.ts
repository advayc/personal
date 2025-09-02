import type { NextApiRequest, NextApiResponse } from 'next';

// Enhanced proxy that fetches external content and serves it without frame-busting headers.
// Includes fallback mechanisms and better error handling.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set comprehensive CORS headers for all requests
  const setCorsHeaders = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, User-Agent, Referer, Cookie, X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Content-Type, Date, Server, Transfer-Encoding, X-Frame-Options');
    res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  };

  // Set CORS headers immediately
  setCorsHeaders();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  let target = (req.query.url as string) || '';
  if (!target || !/^https?:\/\//i.test(target)) {
    setCorsHeaders(); // Ensure CORS headers on error response
    res.status(400).send('Missing or invalid url param');
    return;
  }
  
  // Decode HTML entities that might be present in URLs
  target = target.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");

  // Unwrap already-proxied URLs to avoid double-encoding
  let unwrapped = false;
  try {
    const parsed = new URL(target, `http://${req.headers.host}`);
    if (parsed.pathname === '/api/proxy' && parsed.searchParams.get('url')) {
      target = parsed.searchParams.get('url') as string;
      unwrapped = true;
    }
  } catch {
    // If target is a relative URL, check if it's already been wrapped
    if (target.startsWith('/api/proxy?url=')) {
      try {
        const urlParam = target.substring('/api/proxy?url='.length);
        target = decodeURIComponent(urlParam);
        unwrapped = true;
      } catch {
        // ignore decode errors
      }
    }
  }

  // Normalize target for better iframe compatibility (e.g., Google)
  let normalizedTarget = target;
  try {
    const u = new URL(target);
    if (/(^|\.)google\.(com|ca|co\.[a-z]{2}|[a-z]{2})$/i.test(u.hostname) && !u.searchParams.has('igu')) {
      u.searchParams.set('igu', '1');
      normalizedTarget = u.toString();
    }
  } catch {
    // ignore
  }

  // List of fallback user agents for better compatibility
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  ];

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    // First attempt with standard headers and forwarded method/body
    let upstream;
    const method = req.method || 'GET';
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': randomUserAgent,
      'Accept': (req.headers['accept'] as string) || '*/*',
      'Accept-Language': (req.headers['accept-language'] as string) || 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'DNT': '1'
    };
    // Forward common headers when present
    if (req.headers['cookie']) upstreamHeaders['Cookie'] = req.headers['cookie'] as string;
    if (req.headers['referer']) upstreamHeaders['Referer'] = req.headers['referer'] as string;
    if (req.headers['origin']) upstreamHeaders['Origin'] = req.headers['origin'] as string;
    const contentTypeHeader = (req.headers['content-type'] as string) || '';
    if (contentTypeHeader) upstreamHeaders['Content-Type'] = contentTypeHeader;
    const buildBody = () => {
      if (method === 'GET' || method === 'HEAD') return undefined;
      const body = (req as any).body;
      if (typeof body === 'string' || body instanceof Buffer) return body as any;
      if (body && typeof body === 'object' && contentTypeHeader.includes('application/json')) {
        return JSON.stringify(body);
      }
      return undefined;
    };
    try {
      upstream = await fetch(normalizedTarget, {
        method,
        headers: upstreamHeaders,
        body: buildBody(),
        redirect: 'follow',
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
    } catch (firstError) {
      // Fallback attempt with minimal headers
      console.warn('First fetch failed, trying fallback:', firstError);
      upstream = await fetch(normalizedTarget, {
        method,
        headers: {
          'User-Agent': randomUserAgent,
          'Accept': (req.headers['accept'] as string) || '*/*',
          ...(req.headers['cookie'] ? { Cookie: req.headers['cookie'] as string } : {}),
          ...(req.headers['referer'] ? { Referer: req.headers['referer'] as string } : {}),
          ...(req.headers['origin'] ? { Origin: req.headers['origin'] as string } : {})
        },
        body: buildBody(),
        redirect: 'follow',
        signal: AbortSignal.timeout(30000)
      });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    
    // Check if this is a font file or other asset that needs special CORS handling
    const isFontFile = contentType.includes('font/') || 
                      /\.(woff2?|ttf|otf|eot)$/i.test(new URL(normalizedTarget).pathname) ||
                      contentType.includes('application/font-') ||
                      contentType.includes('application/x-font-') ||
                      contentType.includes('application/octet-stream') && /\.(woff2?|ttf|otf|eot)$/i.test(new URL(normalizedTarget).pathname);
    
    const isImageFile = contentType.includes('image/') || 
                       /\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/i.test(new URL(normalizedTarget).pathname);
                       
    const isCSSFile = contentType.includes('text/css') ||
                     /\.css$/i.test(new URL(normalizedTarget).pathname);
    
    // Set response headers for better compatibility and embedding
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    // For font files, add specific CORS headers to ensure they load properly
    if (isFontFile) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Cache-Control');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    
    // For images and CSS, ensure proper CORS headers
    if (isImageFile || isCSSFile) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
    }
    
    // Remove frame-busting and restrictive security headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('Referrer-Policy');
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.removeHeader('Cross-Origin-Embedder-Policy');
    res.removeHeader('Cross-Origin-Resource-Policy');
    res.removeHeader('Origin-Agent-Cluster');
    res.removeHeader('Permissions-Policy');
    res.removeHeader('Strict-Transport-Security');
    
    // Add permissive headers for iframe embedding
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    
    // Set comprehensive CORS headers again to ensure they're not overridden
    setCorsHeaders();
    
    // Also add an allow-all CSP header (with sandbox) to supersede upstream CSP (meta is also injected)
    res.setHeader(
      'Content-Security-Policy',
      "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; media-src * data: blob:; connect-src * data: blob:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; font-src * data:; object-src *; frame-src *;"
    );

    if (contentType.includes('text/html')) {
      let html = await upstream.text();

      // Handle empty or malformed HTML
      if (!html || html.trim().length === 0) {
        html = `<html><head><title>Empty Response</title></head><body><h1>Empty Response</h1><p>The server returned an empty response.</p></body></html>`;
      }

      // Best-effort: ensure relative URLs work via <base>, and keep navigation inside proxy
  const urlObj = new URL(normalizedTarget);
      const baseHref = urlObj.origin + (urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname.replace(/[^/]*$/, ''));

      // Enhanced injection script for better compatibility
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
            
            // Log successful proxy injection
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
          <meta http-equiv="Content-Security-Policy" content="frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; media-src * data: blob:; connect-src * data: blob:; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval' data: blob:; font-src * data:; object-src *; frame-src *;">
          <meta http-equiv="Access-Control-Allow-Origin" content="*">
          <meta http-equiv="Access-Control-Allow-Methods" content="GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD">
          <meta http-equiv="Access-Control-Allow-Headers" content="*">
          <style id="__proxy_base_css">html,body{opacity:1 !important;}</style>
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

      // Replace anchor hrefs (more comprehensive)
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

      // Rewrite iframe and frame sources to go through proxy to avoid X-Frame-Options blocks
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

      // Rewrite link/script/img/source/video/audio/track/poster/srcset to proxy
      const shouldSkip = (u: string) => /^(?:javascript:|mailto:|tel:|data:|blob:|#)/i.test(u);

      // link href: DO NOT rewrite stylesheet links to keep CSS loading from original domain
      html = html.replace(/<link\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (m, pre, href, post) => {
        const preLower = pre.toLowerCase();
        if (preLower.includes('rel="stylesheet"') || preLower.includes("rel='stylesheet'") || preLower.includes('rel=stylesheet') || preLower.includes('type="text/css"') || preLower.includes("type='text/css'")) {
          return m; // leave CSS links untouched to preserve relative URLs inside CSS
        }
        if (shouldSkip(href)) return m;
        try {
          const abs = new URL(href, baseHref).toString();
          return `<link ${pre}href="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      // script src
      html = html.replace(/<script\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try {
          const abs = new URL(src, baseHref).toString();
          return `<script ${pre}src="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      // img src and srcset
      html = html.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try {
          const abs = new URL(src, baseHref).toString();
          return `<img ${pre}src="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      const rewriteSrcset = (attrVal: string) => {
        try {
          const parts = attrVal.split(',').map(s => s.trim()).filter(Boolean);
          const mapped = parts.map(p => {
            const [u, w] = p.split(/\s+/);
            try {
              const abs = new URL(u, baseHref).toString();
              return `${safe(abs)}${w ? ' ' + w : ''}`;
            } catch { return p; }
          });
          return mapped.join(', ');
        } catch { return attrVal; }
      };
      html = html.replace(/<img([^>]*?)srcset=["']([^"']+)["']([^>]*)>/gi, (m, pre, srcset, post) => {
        return `<img${pre}srcset="${rewriteSrcset(srcset)}"${post}>`;
      });
      // source src / srcset
      html = html.replace(/<source\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try {
          const abs = new URL(src, baseHref).toString();
          return `<source ${pre}src="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      html = html.replace(/<source([^>]*?)srcset=["']([^"']+)["']([^>]*)>/gi, (m, pre, srcset, post) => {
        return `<source${pre}srcset="${rewriteSrcset(srcset)}"${post}>`;
      });
      // video/audio/track/poster
      html = html.replace(/<video\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try { const abs = new URL(src, baseHref).toString(); return `<video ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<video\s+([^>]*?)poster=["']([^"']+)["']([^>]*)>/gi, (m, pre, poster, post) => {
        if (shouldSkip(poster)) return m;
        try { const abs = new URL(poster, baseHref).toString(); return `<video ${pre}poster="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<audio\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try { const abs = new URL(src, baseHref).toString(); return `<audio ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<track\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        if (shouldSkip(src)) return m;
        try { const abs = new URL(src, baseHref).toString(); return `<track ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });

      // Enhanced client-side navigation interceptor
      const clientSideScript = `
        <script>
        (function(){
          try {
            var PROXY_PATH = '${proxyPath}';
            var BASE = '${baseHref}';
            var TARGET_URL = '${normalizedTarget}';
            
            // Override XMLHttpRequest to proxy AJAX calls
            var origXHR = window.XMLHttpRequest;
            window.XMLHttpRequest = function() {
              var xhr = new origXHR();
              var origOpen = xhr.open;
              xhr.open = function(method, url, async, user, password) {
                try {
                  if (url && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith(PROXY_PATH)) {
                    var absoluteUrl = new URL(url, BASE).toString();
                    url = PROXY_PATH + encodeURIComponent(absoluteUrl);
                    console.log('XHR proxied:', arguments[1], '->', url);
                  }
                } catch(e) {
                  console.warn('XHR proxy error:', e);
                }
                return origOpen.call(this, method, url, async, user, password);
              };
              return xhr;
            };
            
            // Override fetch to proxy fetch calls
            var origFetch = window.fetch;
            window.fetch = function(input, init) {
              try {
                var url = typeof input === 'string' ? input : input.url;
                if (url && !url.startsWith('data:') && !url.startsWith('blob:') && !url.startsWith(PROXY_PATH)) {
                  var absoluteUrl = new URL(url, BASE).toString();
                  var proxiedUrl = PROXY_PATH + encodeURIComponent(absoluteUrl);
                  console.log('Fetch proxied:', url, '->', proxiedUrl);
                  if (typeof input === 'string') {
                    input = proxiedUrl;
                  } else {
                    input = new Request(proxiedUrl, input);
                  }
                }
              } catch(e) {
                console.warn('Fetch proxy error:', e);
              }
              return origFetch.call(window, input, init);
            };
            
            function toProxy(u){
              try { 
                if (u.startsWith(PROXY_PATH)) return u;
                return PROXY_PATH + encodeURIComponent(new URL(u, BASE).toString()); 
              } catch(_) { 
                return u; 
              }
            }

            // Enhanced click handler with better error handling
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
    } else if (isCSSFile) {
      // Handle CSS files to rewrite relative font URLs
      try {
        let css = await upstream.text();
        const urlObj = new URL(normalizedTarget);
        const baseHref = urlObj.origin + (urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname.replace(/[^/]*$/, ''));
        
        // Rewrite url() references in CSS to go through the proxy
        css = css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (match, url) => {
          try {
            if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) {
              return match; // Leave absolute URLs and data URLs as-is
            }
            // Make relative URL absolute and proxy it
            const absoluteUrl = new URL(url, baseHref).toString();
            const proxiedUrl = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `url("${proxiedUrl}")`;
          } catch {
            return match; // If URL parsing fails, leave as-is
          }
        });
        
        res.status(upstream.status).send(css);
        return;
      } catch (cssError) {
        console.error('CSS processing error:', cssError);
        // Fall through to normal content handling
      }
    }

    // Non-HTML: pass through bytes with better error handling
    try {
      const arrBuf = await upstream.arrayBuffer();
      
      // Ensure CORS headers are maintained for non-HTML content
      setCorsHeaders();
      
      // Apply specific CORS headers for assets (same logic as above)
      if (isFontFile) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, Cache-Control');
        res.setHeader('Access-Control-Max-Age', '86400');
      }
      
      if (isImageFile || isCSSFile) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
      }
      
      // Copy important headers from upstream response
      const headersToProxy = ['content-length', 'content-range', 'last-modified', 'etag', 'accept-ranges'];
      headersToProxy.forEach(headerName => {
        const headerValue = upstream.headers.get(headerName);
        if (headerValue) {
          res.setHeader(headerName, headerValue);
        }
      });
      
      res.status(upstream.status).send(Buffer.from(arrBuf));
    } catch (bufferError) {
      console.error('Buffer processing error:', bufferError);
      setCorsHeaders(); // Ensure CORS headers on error
      res.status(500).send('Failed to process non-HTML content');
    }
  } catch (err: any) {
    console.error('Proxy error for URL:', target, 'Error:', err);

    // Ensure CORS headers are set even for error responses
    setCorsHeaders();

    // Enhanced error response with fallback content
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proxy Error</title>
        <meta http-equiv="Access-Control-Allow-Origin" content="*">
        <meta http-equiv="Access-Control-Allow-Methods" content="GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD">
        <meta http-equiv="Access-Control-Allow-Headers" content="*">
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
              <li>CORS policy restrictions</li>
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