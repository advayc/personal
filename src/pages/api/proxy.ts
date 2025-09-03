// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const target = req.query.url as string;
  if (!target) {
    res.status(400).json({ error: 'Missing url param' });
    return;
  }

  // Set CORS headers and iframe-friendly headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Copy request headers and ensure we have proper Accept headers for different content types
    const headers: HeadersInit = {
      'User-Agent':
        req.headers['user-agent'] ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
      // Request uncompressed content to avoid encoding issues
      'Accept-Encoding': 'identity',
    };
    
    // Forward essential headers for better content negotiation
    if (req.headers['accept']) headers['Accept'] = req.headers['accept'] as string;
    if (req.headers['referer']) headers['Referer'] = req.headers['referer'] as string;
    
    // Specific headers for image types to ensure proper binary handling
    if (target.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf)$/i)) {
      headers['Accept'] = 'image/*, */*';
    }

    const response = await fetch(target, { headers });

    if (!response.ok) {
      res.status(response.status).json({ 
        error: `Fetch failed: ${response.status} ${response.statusText}` 
      });
      return;
    }

    // Copy headers but strip frame-busting ones and problematic headers
    const skipHeaders = [
      'x-frame-options', 
      'content-security-policy', 
      'content-encoding',
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    response.headers.forEach((value, key) => {
      if (!skipHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

  // Parse content type safely
  const contentType = response.headers.get('content-type') || '';
  const lowerCT = contentType.toLowerCase();
  const isHTML = lowerCT.includes('text/html');
  const isCSS = lowerCT.includes('text/css');
  const isJS = lowerCT.includes('application/javascript') || lowerCT.includes('text/javascript');

    if (isHTML) {
      let body = await response.text();

      // Remove the base tag injection as it's causing issues
      // Instead, rewrite ALL URLs to go through our proxy

      // Rewrite absolute URLs that match the target domain
      const targetDomain = new URL(target).origin;
      body = body.replace(
        new RegExp(`(href|src)=["']${targetDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)["']`, 'gi'),
        (_match, attr, path) => {
          try {
            const fullUrl = targetDomain + path;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `${attr}="${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );

      // Rewrite protocol-relative URLs //example.com/foo -> https://example.com/foo through proxy
      body = body.replace(
        /(href|src)=["'](\/\/[^"']+)["']/gi,
        (_match, attr, restWithSlashes) => {
          try {
            // restWithSlashes begins with //
            const fullUrl = `https://${restWithSlashes.replace(/^\/\//, '')}`;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `${attr}="${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );

      // Rewrite relative URLs so CSS, JS, images go through proxy
      body = body.replace(
        /(href|src)=["'](?!https?:\/\/|data:|\/api\/proxy)([^"']+)["']/gi,
        (_match, attr, relUrl) => {
          try {
            const absoluteUrl = new URL(relUrl, target).toString();
            const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `${attr}="${proxied}"`;
          } catch (e) {
            return _match; // If URL parsing fails, return unchanged
          }
        }
      );

      // Rewrite srcset attributes (comma-separated URLs possibly with descriptors)
      body = body.replace(
        /(srcset)=["']([^"']+)["']/gi,
        (_m, attr, value) => {
          try {
            const rewritten = value
              .split(',')
              .map((part: string) => {
                const trimmed = part.trim();
                const [u, descriptor] = trimmed.split(/\s+/, 2);
                if (/^(https?:\/\/|data:|\/api\/proxy)/i.test(u)) return trimmed; // leave
                const absoluteUrl = new URL(u, target).toString();
                const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                return descriptor ? `${proxied} ${descriptor}` : proxied;
              })
              .join(', ');
            return `${attr}="${rewritten}"`;
          } catch {
            return `${attr}="${value}"`;
          }
        }
      );

      // Rewrite form action attributes
      body = body.replace(
        /(action)=["'](?!https?:\/\/|data:|\/api\/proxy)([^"']+)["']/gi,
        (_match, attr, relUrl) => {
          try {
            const absoluteUrl = new URL(relUrl, target).toString();
            const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `${attr}="${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );

      // Also proxy stylesheets' url() references
      body = body.replace(
        /(url\(["']?)(?!https?:\/\/|data:|\/api\/proxy)(.*?)(["']?\))/gi,
        (match, prefix, relUrl, suffix) => {
          try {
            const cleanUrl = relUrl.replace(/['"]/g, '');
            const absoluteUrl = new URL(cleanUrl, target).toString();
            const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `${prefix}${proxied}${suffix}`;
          } catch (e) {
            return match; // If URL parsing fails, return unchanged
          }
        }
      );

      // Remove potentially problematic scripts and iframe-unfriendly code
      body = body.replace(
        /<script\b[^>]*\bonload\s*=\s*["'][^"']*["'][^>]*>.*?<\/script>/gi, 
        ''
      );

      // Remove history manipulation scripts that cause SecurityError
      body = body.replace(
        /history\.(pushState|replaceState|back|forward)/gi, 
        '/* removed history manipulation */'
      );

      // Remove any existing base tags that might conflict
      body = body.replace(/<base\b[^>]*>/gi, '');

      // Remove SRI that could break when assets are proxied
      body = body.replace(/\s+integrity=["'][^"']+["']/gi, '');

      // Inject a lightweight shim that routes fetch/XHR through the proxy and fixes relative resolution
      const shim = `
        <script>(function(){
          try {
            var PROXY_ENDPOINT = '/api/proxy?url=';
            var ORIGINAL_BASE = ${JSON.stringify(target)};
            var abs = function(u){
              try { return new URL(u, ORIGINAL_BASE).toString(); } catch(e){ return u; }
            };
            // Hook fetch
            var _fetch = window.fetch;
            window.fetch = function(input, init){
              try {
                var url = (typeof input === 'string') ? input : (input && input.url) ? input.url : String(input);
                if (!/^data:|^blob:|^about:/.test(url)) {
                  // leave already proxied URLs
                  if (!/^\/api\/proxy\?url=/.test(url)) {
                    var targetUrl;
                    if (/^https?:\/\//.test(url)) {
                      try {
                        var parsed = new URL(url, window.location.href);
                        // If constructed against our own origin, remap to ORIGINAL_BASE origin
                        if (parsed.origin === window.location.origin) {
                          var pathAndQuery = parsed.pathname + parsed.search + parsed.hash;
                          targetUrl = new URL(pathAndQuery, ORIGINAL_BASE).toString();
                        } else {
                          targetUrl = url;
                        }
                      } catch(e) { targetUrl = url; }
                    } else {
                      targetUrl = abs(url);
                    }
                    input = PROXY_ENDPOINT + encodeURIComponent(targetUrl);
                  }
                }
              } catch(e) {}
              return _fetch.apply(this, arguments);
            };
            // Hook XMLHttpRequest
            var _open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url){
              try {
                if (typeof url === 'string' && !/^data:|^blob:|^about:/.test(url) && !/^\/api\/proxy\?url=/.test(url)) {
                  var targetUrl;
                  if (/^https?:\/\//.test(url)) {
                    try {
                      var parsed = new URL(url, window.location.href);
                      if (parsed.origin === window.location.origin) {
                        var pathAndQuery = parsed.pathname + parsed.search + parsed.hash;
                        targetUrl = new URL(pathAndQuery, ORIGINAL_BASE).toString();
                      } else {
                        targetUrl = url;
                      }
                    } catch(e) { targetUrl = url; }
                  } else {
                    targetUrl = abs(url);
                  }
                  url = PROXY_ENDPOINT + encodeURIComponent(targetUrl);
                }
              } catch(e) {}
              return _open.apply(this, [method, url].concat([].slice.call(arguments, 2)));
            };
            // Neutralize attempts to access top/document across sandboxes
            try { Object.defineProperty(window, 'crossOriginIsolated', { get: function(){ return false; } }); } catch(e) {}
          } catch(e) { console.error('proxy shim failed', e); }
        })();</script>
      `;
      if (body.match(/<head[^>]*>/i)) {
        body = body.replace(/<head[^>]*>/i, (m) => `${m}${shim}`);
      } else if (body.includes('</head>')) {
        body = body.replace('</head>', `${shim}</head>`);
      } else if (body.includes('<body')) {
        body = body.replace('<body', `${shim}<body`);
      } else {
        body = shim + body;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(body);
    } else if (isCSS) {
      // Rewrite url() in standalone CSS files using the CSS file as base
      const cssText = await response.text();
      const rewritten = cssText.replace(
        /(url\(["']?)(?!https?:\/\/|data:|\/api\/proxy)(.*?)(["']?\))/gi,
        (match, prefix, relUrl, suffix) => {
          try {
            const cleanUrl = relUrl.replace(/["']/g, '');
            const absoluteUrl = new URL(cleanUrl, target).toString();
            const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `${prefix}${proxied}${suffix}`;
          } catch (e) {
            return match;
          }
        }
      );
      res.setHeader('Content-Type', contentType || 'text/css; charset=utf-8');
      res.send(rewritten);
    } else if (isJS) {
      // Best-effort: leave JS content untouched to avoid breaking code
      // Consider future: rewrite obvious fetch('/path') patterns
      const js = await response.text();
      res.setHeader('Content-Type', contentType || 'application/javascript; charset=utf-8');
      res.send(js);
    } else {
      // Handle binary files (images, fonts, etc.) and other content types
      try {
        // Special handling for known binary file types
        const isBinaryFile = /\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf|pdf|zip)$/i.test(target) || 
                            contentType.includes('image/') || 
                            contentType.includes('font/') || 
                            contentType.includes('application/font') ||
                            contentType.includes('application/octet-stream');

        if (isBinaryFile) {
          // For binary data, ensure correct Content-Type
          res.setHeader('Content-Type', contentType);
          
          // Add caching headers for better performance
          res.setHeader('Cache-Control', 'public, max-age=86400');
          
          // Get and forward the content length if available
          const contentLength = response.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);
          
          // Stream the binary data
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.send(buffer);
        } else {
          // For other types of files, try direct streaming with proper Content-Type
          res.setHeader('Content-Type', contentType);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.send(buffer);
        }
      } catch (err: any) {
        console.error('Error streaming response:', err);
        res.status(500).json({ error: `Error processing response: ${err.message || 'Unknown error'}` });
      }
    }
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: `Proxy fetch failed: ${err.message || 'Unknown error'}` });
  }
}
