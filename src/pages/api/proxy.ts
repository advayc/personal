import type { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false
  }
};

// Enhanced proxy that fetches external content and serves it without frame-busting headers.
// Includes fallback mechanisms and better error handling.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let target = (req.query.url as string) || '';
  if (!target || !/^https?:\/\//i.test(target)) {
    res.status(400).send('Missing or invalid url param');
    return;
  }

  // Unwrap already-proxied URLs (defensive)
  try {
    while (true) {
      const decoded = decodeURIComponent(target);
      if (/\/api\/proxy\?url=/i.test(decoded)) {
        const u = new URL(decoded, `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`);
        const inner = u.searchParams.get('url');
        if (inner) { target = inner; continue; }
      }
      break;
    }
  } catch {}

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

  const method = (req.method || 'GET').toUpperCase();
  const readRawBody = async (r: NextApiRequest): Promise<Buffer | undefined> => {
    if (method === 'GET' || method === 'HEAD') return undefined;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      (r as any).on('data', (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      (r as any).on('end', () => resolve(Buffer.concat(chunks)));
      (r as any).on('error', reject);
    });
  };

  // List of fallback user agents for better compatibility
  const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
  ];

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  try {
    // Prepare method, body and safe headers
    const targetUrl = new URL(normalizedTarget);
    const incomingHeaders = req.headers;
    const forwardHeaders: Record<string, string> = {
      'user-agent': randomUserAgent,
      'accept': incomingHeaders['accept'] as string || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'accept-language': (incomingHeaders['accept-language'] as string) || 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'pragma': 'no-cache',
      'upgrade-insecure-requests': '1'
    };
    if (incomingHeaders['content-type']) forwardHeaders['content-type'] = String(incomingHeaders['content-type']);
    if (incomingHeaders['cookie']) forwardHeaders['cookie'] = String(incomingHeaders['cookie']);
    // Spoof a target-origin Referer/Origin when applicable (helps with CSRF checks)
    forwardHeaders['referer'] = targetUrl.origin + '/';
    if (method !== 'GET' && method !== 'HEAD') {
      forwardHeaders['origin'] = targetUrl.origin;
    }

    const rawBody = await readRawBody(req);

    // First attempt
    let upstream: Response;
    try {
      upstream = await fetch(normalizedTarget, {
        method,
        headers: forwardHeaders,
        body: rawBody as any,
        redirect: 'follow',
        signal: AbortSignal.timeout(30000)
      } as RequestInit);
    } catch (firstError) {
      console.warn('First fetch failed, trying fallback:', firstError);
      const fallbackHeaders: Record<string, string> = { 'user-agent': randomUserAgent, 'accept': '*/*' };
      if (incomingHeaders['content-type']) fallbackHeaders['content-type'] = String(incomingHeaders['content-type']);
      upstream = await fetch(normalizedTarget, {
        method,
        headers: fallbackHeaders,
        body: rawBody as any,
        redirect: 'follow',
        signal: AbortSignal.timeout(30000)
      } as RequestInit);
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const finalUrl = upstream.url || normalizedTarget;
    
    // Set response headers for better compatibility
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Do NOT set X-Frame-Options at all; leave it absent
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (contentType.includes('text/html')) {
      let html = await upstream.text();

      // Handle empty or malformed HTML
      if (!html || html.trim().length === 0) {
        html = `<html><head><title>Empty Response</title></head><body><h1>Empty Response</h1><p>The server returned an empty response.</p></body></html>`;
      }

      // Best-effort: ensure relative URLs work via <base>, and keep navigation inside proxy
      const urlObj = new URL(finalUrl);
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

      // Rewrite scripts and stylesheets
      html = html.replace(/<script\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        try {
          const abs = new URL(src, baseHref).toString();
          // Strip SRI/crossorigin to avoid blocks when proxying
          pre = pre.replace(/\sintegrity=["'][^"']+["']/gi, '').replace(/\scrossorigin=["'][^"']+["']/gi, '');
          return `<script ${pre}src="${safe(abs)}"${post}>`;
        } catch { return m; }
      });
      html = html.replace(/<link\s+([^>]*?)href=["']([^"']+)["']([^>]*)>/gi, (m, pre, href, post) => {
        try {
          const abs = new URL(href, baseHref).toString();
          pre = pre.replace(/\sintegrity=["'][^"']+["']/gi, '').replace(/\scrossorigin=["'][^"']+["']/gi, '');
          return `<link ${pre}href="${safe(abs)}"${post}>`;
        } catch { return m; }
      });

      // Images and media
      html = html.replace(/<(img|input)\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, tag, pre, src, post) => {
        try { const abs = new URL(src, baseHref).toString(); return `<${tag} ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<(video|audio)\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, tag, pre, src, post) => {
        try { const abs = new URL(src, baseHref).toString(); return `<${tag} ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<video\s+([^>]*?)poster=["']([^"']+)["']([^>]*)>/gi, (m, pre, poster, post) => {
        try { const abs = new URL(poster, baseHref).toString(); return `<video ${pre}poster="${safe(abs)}"${post}>`; } catch { return m; }
      });
      html = html.replace(/<source\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
        try { const abs = new URL(src, baseHref).toString(); return `<source ${pre}src="${safe(abs)}"${post}>`; } catch { return m; }
      });

      // srcset rewriting helper
      const rewriteSrcset = (val: string) => {
        try {
          const parts = val.split(',');
          const out = parts.map(p => {
            const trimmed = p.trim();
            const spaceIdx = trimmed.indexOf(' ');
            const urlPart = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
            const desc = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
            if (/^data:|^blob:|^javascript:/i.test(urlPart)) return trimmed; 
            const abs = withGoogleIgu(new URL(urlPart, baseHref).toString());
            return `${safe(abs)}${desc}`;
          });
          return out.join(', ');
        } catch { return val; }
      };
      html = html.replace(/\s(srcset)=["']([^"']+)["']/gi, (m, attr, val) => ` ${attr}="${rewriteSrcset(val)}"`);

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

      // Inline style url(...) and <style> blocks
      const rewriteCssUrls = (css: string) => {
        try {
          return css
            // @import "..."
            .replace(/@import\s+["']([^"']+)["']/gi, (m, u) => {
              try { const abs = new URL(u, baseHref).toString(); return `@import "${safe(abs)}"`; } catch { return m; }
            })
            // url(...) with or without quotes
            .replace(/url\(([^)]+)\)/gi, (m, group) => {
              const raw = group.trim().replace(/^['"]|['"]$/g, '');
              if (/^data:|^blob:/i.test(raw)) return m;
              try { const abs = new URL(raw, baseHref).toString(); return `url(${safe(abs)})`; } catch { return m; }
            });
        } catch { return css; }
      };
      html = html.replace(/<style(\b[^>]*)>([\s\S]*?)<\/style>/gi, (m, attrs, css) => `<style${attrs}>${rewriteCssUrls(css)}</style>`);
      html = html.replace(/style=["']([\s\S]*?)["']/gi, (m, css) => `style="${rewriteCssUrls(css)}"`);

      // Enhanced client-side navigation and network interceptor
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

            // fetch() override to route cross-origin requests through proxy
            try {
              var originalFetch = window.fetch;
              window.fetch = function(input, init){
                try {
                  var url = (typeof input === 'string') ? input : (input && input.url ? input.url : '');
                  if (url && !url.startsWith(PROXY_PATH)) {
                    url = toProxy(url);
                    if (typeof input === 'string') {
                      input = url;
                    } else if (input && input.url) {
                      input = new Request(url, input);
                    }
                    if (init && init.mode) init.mode = 'same-origin';
                  }
                } catch(_) {}
                return originalFetch.apply(this, arguments);
              };
            } catch(err) { console.error('fetch override error:', err); }

            // XMLHttpRequest override
            try {
              var OrigOpen = XMLHttpRequest.prototype.open;
              XMLHttpRequest.prototype.open = function(method, url){
                try { if (url && !String(url).startsWith(PROXY_PATH)) { url = toProxy(String(url)); } } catch(_) {}
                return OrigOpen.apply(this, [method, url].concat([].slice.call(arguments, 2)));
              };
            } catch(err) { console.error('XHR override error:', err); }

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
    }

    // CSS responses: rewrite url(...) references
    if (contentType.includes('text/css') || /\.css(\?|$)/i.test(finalUrl)) {
      try {
        const cssText = await upstream.text();
        const baseForCss = finalUrl.replace(/[^\/]*$/, '');
        const rewritten = cssText
          .replace(/@import\s+["']([^"']+)["']/gi, (m, u) => { try { const abs = new URL(u, baseForCss).toString(); return `@import "${'/api/proxy?url=' + encodeURIComponent(abs)}"`; } catch { return m; } })
          .replace(/url\(([^)]+)\)/gi, (m, group) => { const raw = group.trim().replace(/^['"]|['"]$/g, ''); if (/^data:|^blob:/i.test(raw)) return m; try { const abs = new URL(raw, baseForCss).toString(); return `url(${('/api/proxy?url=' + encodeURIComponent(abs))})`; } catch { return m; } });
        res.status(upstream.status).setHeader('Content-Type', 'text/css').send(rewritten);
      } catch (e) {
        console.error('CSS rewrite error:', e);
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).send(buf);
      }
      return;
    }

    // Non-HTML/CSS: stream through with header sanitation
    try {
      // Forward a subset of safe headers
      const hopByHop = new Set(['content-security-policy','x-frame-options','cross-origin-opener-policy','cross-origin-embedder-policy','cross-origin-resource-policy']);
      const passHeaders: Record<string, string> = {};
      ['content-type','content-disposition','cache-control','pragma','expires','accept-ranges','etag','last-modified'].forEach((h) => {
        const v = upstream.headers.get(h);
        if (v && !hopByHop.has(h)) res.setHeader(h, v);
      });

      if (upstream.body) {
        res.status(upstream.status);
        const nodeStream = Readable.fromWeb(upstream.body as any);
        nodeStream.on('error', (e) => { try { res.destroy(e as any); } catch {} });
        nodeStream.pipe(res);
      } else {
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.status(upstream.status).send(buf);
      }
    } catch (bufferError) {
      console.error('Buffer/stream processing error:', bufferError);
      res.status(500).send('Failed to process content');
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
