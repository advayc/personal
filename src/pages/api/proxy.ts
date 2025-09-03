// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let target = req.query.url as string;
  // Some pages (or our HTML rewrites) may double-encode or HTML-escape query
  // parameters (e.g. `%26amp%3B` -> `&amp;` -> `&`). Decode percent-encoding
  // first (up to a few iterations) and then normalize common HTML entities
  // so `new URL(target)` succeeds and fetch() hits the intended resource.
  if (typeof target === 'string') {
    // First, repeatedly decode percent-encodings (limit iterations)
    try {
      let prev = null;
      let cur = target;
      for (let i = 0; i < 4; i++) {
        try {
          const decoded = decodeURIComponent(cur);
          if (decoded === cur || decoded === prev) break;
          prev = cur;
          cur = decoded;
        } catch (e) {
          break;
        }
      }
      target = cur;
    } catch (e) {
      // ignore and fall back to entity normalization below
    }

    // Then replace HTML entities that may have survived decoding
    target = target.replace(/&amp;/gi, '&')
                   .replace(/&lt;/gi, '<')
                   .replace(/&gt;/gi, '>')
                   .replace(/&quot;/gi, '"')
                   .replace(/&apos;/gi, "'");
  }
  
  // Handle cases where the request might be a search or relative URL without the url parameter
  if (!target) {
    // Check if this looks like a Bing search request
    if (req.query.q || req.query.search) {
      const searchQuery = req.query.q || req.query.search;
      target = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery as string)}`;
    } else if (Object.keys(req.query).length > 0) {
      // If there are query parameters but no url, it might be a relative request to Bing
      const queryString = new URLSearchParams(req.query as any).toString();
      target = `https://www.bing.com/search?${queryString}`;
    } else {
      res.status(400).json({ error: 'Missing url param' });
      return;
    }
  }


  // If the target is a Google domain, redirect to Bing with the same query if possible
  try {
    const parsedUrl = new URL(target);
    if (/\.google\./i.test(parsedUrl.hostname)) {
      // If it's a search, extract the query and redirect to Bing search
      const q = parsedUrl.searchParams.get('q');
      if (q) {
        res.writeHead(302, { Location: `https://www.bing.com/search?q=${encodeURIComponent(q)}` });
        res.end();
        return;
      } else {
        // Otherwise, just redirect to Bing homepage
        res.writeHead(302, { Location: 'https://www.bing.com/' });
        res.end();
        return;
      }
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  // Set CORS headers and iframe-friendly headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', 'frame-ancestors *');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

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
    
    // Forward essential headers for proper content negotiation, but exclude problematic ones
    const allowedHeaders = ['accept', 'accept-language', 'referer', 'cookie', 'origin', 'dnt'];
    allowedHeaders.forEach(header => {
      if (req.headers[header]) headers[header] = req.headers[header] as string;
    });
    
    // Handle challenge-specific headers for sites like Bing
    if (target.includes('bing.com') || target.includes('google.com')) {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'cross-site';
      headers['Sec-Fetch-User'] = '?1';
      headers['Upgrade-Insecure-Requests'] = '1';
    }
    
    // Specific headers for image types to ensure proper binary handling
    if (target.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf)$/i)) {
      headers['Accept'] = 'image/*, */*';
    }

    // Filter headers that can cause issues with fetch
    const blockedHeaders = [
      'host', 
      'content-length', 
      'connection', 
      'keep-alive', 
      'proxy-authenticate', 
      'proxy-authorization', 
      'te', 
      'trailers', 
      'transfer-encoding', 
      'upgrade'
    ];
    
    // Forward safe headers from the original request
    Object.keys(req.headers).forEach((key) => {
      if (!blockedHeaders.includes(key.toLowerCase()) && !headers[key]) {
        headers[key] = req.headers[key] as string;
      }
    });

    // Ensure cookies are forwarded for session-based verification
    if (req.headers['cookie']) {
      headers['Cookie'] = req.headers['cookie'] as string;
    }

    const response = await fetch(target, { 
      headers,
      // Forward the request method and body for non-GET requests
      method: req.method !== 'OPTIONS' ? req.method : 'GET',
      body: req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS' ? JSON.stringify(req.body) : undefined,
      redirect: 'follow',
      credentials: 'include'
    });

    if (!response.ok) {
      console.error(`Fetch failed for ${target}: ${response.status} ${response.statusText}`);
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
      'access-control-allow-headers',
      'x-content-type-options',
      'referrer-policy',
      'permissions-policy',
      'cross-origin-embedder-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy'
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
        /(srcset)=\["']([^"']+)\["']/gi,
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
      // Rewrite <source srcset> in <picture> tags
      body = body.replace(
        /(<source[^>]+srcset=["'])([^"']+)(["'])/gi,
        (match, prefix, srcset, suffix) => {
          try {
            const rewritten = srcset
              .split(',')
              .map((part: string) => {
                const trimmed = part.trim();
                const [u, descriptor] = trimmed.split(/\s+/, 2);
                if (/^(https?:\/\/|data:|\/api\/proxy)/i.test(u)) return trimmed;
                const absoluteUrl = new URL(u, target).toString();
                const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
                return descriptor ? `${proxied} ${descriptor}` : proxied;
              })
              .join(', ');
            return `${prefix}${rewritten}${suffix}`;
          } catch {
            return match;
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

      // Remove frame-busting scripts and add Google fallback
      body = body.replace(
        /(if\s*\(\s*self\s*!=\s*top\s*\)|if\s*\(\s*top\s*!=\s*self\s*\)|if\s*\(\s*window\s*!=\s*top\s*\)|if\s*\(\s*top\s*!=\s*window\s*\))[^}]*}/gi,
        '/* removed frame busting */'
      );
      // Google fallback: if google.com refused to connect, show a friendly error or redirect to Bing
      if (/google\\.com refused to connect|X-Frame-Options|blocked by Chrome security policies/i.test(body)) {
        body = `<div style="font-family:sans-serif;text-align:center;padding:3em"><h2>Google search is blocked in this browser.</h2><p>Try <a href='https://www.bing.com/search?q=' target='_self'>Bing Search</a> instead.</p></div>`;
      }

      // Remove specific frame-busting patterns
      body = body.replace(
        /(top\.location\s*=|top\.location\.href\s*=|window\.top\.location\s*=)/gi,
        '/* removed frame busting redirect */'
      );

      // Remove X-Frame-Options via meta tags
      body = body.replace(
        /<meta[^>]*http-equiv\s*=\s*["']X-Frame-Options["'][^>]*>/gi,
        ''
      );

      // Remove any existing base tags that might conflict
      body = body.replace(/<base\b[^>]*>/gi, '');

      // Remove SRI that could break when assets are proxied
      body = body.replace(/\s+integrity=["'][^"']+["']/gi, '');

      // Remove or modify target="_blank" attributes to prevent new tab opening
      body = body.replace(/\starget=["']_blank["']/gi, ' target="_self"');
      body = body.replace(/\starget=["']_new["']/gi, ' target="_self"');

      // Inject a lightweight shim that routes fetch/XHR through the proxy and fixes relative resolution
      const shim = `
        <script>(function(){
          try {
            var PROXY_ENDPOINT = '/api/proxy?url=';
            var ORIGINAL_BASE = ${JSON.stringify(target)};
            var abs = function(u){
              try { return new URL(u, ORIGINAL_BASE).toString(); } catch(e){ return u; }
            };
            
            // Intercept link clicks to navigate within the same window instead of opening new tabs
            document.addEventListener('click', function(e) {
              try {
                var el = e.target;
                // Find the closest anchor tag
                while (el && el.tagName !== 'A' && el.parentElement) {
                  el = el.parentElement;
                }
                if (el && el.tagName === 'A' && el.href) {
                  var href = el.getAttribute('href') || el.href;
                  // Skip if it's a special link (javascript:, mailto:, tel:, etc.)
                  if (/^(javascript:|mailto:|tel:|#)/i.test(href)) return;
                  // Skip if target is set to open in new window/tab
                  if (el.target === '_blank' || el.target === '_new') return;
                  // Skip if ctrl/cmd key is held (user wants new tab)
                  if (e.ctrlKey || e.metaKey) return;
                  e.preventDefault();
                  e.stopPropagation();
                  // Always route through proxy
                  var absUrl;
                  try {
                    absUrl = new URL(href, ORIGINAL_BASE).toString();
                  } catch { absUrl = href; }
                  var proxied = PROXY_ENDPOINT + encodeURIComponent(absUrl);
                  // Send navigation message to parent window
                  try {
                    window.parent.postMessage({
                      type: 'navigate',
                      url: absUrl
                    }, '*');
                  } catch (msgError) {
                    window.location.href = proxied;
                  }
                }
              } catch (clickError) {
                console.log('Link click handling error:', clickError);
              }
            }, true);
            
            // Also handle form submissions to navigate within the same window
            document.addEventListener('submit', function(e) {
              try {
                var form = e.target;
                if (form && form.tagName === 'FORM') {
                  // Skip forms that explicitly target new windows
                  if (form.target === '_blank' || form.target === '_new') {
                    return;
                  }
                  
                  // For GET forms, convert to navigation
                  if (!form.method || form.method.toLowerCase() === 'get') {
                    e.preventDefault();
                    
                    var formData = new FormData(form);
                    var url = new URL(form.action || window.location.href);
                    
                    // Add form data as query parameters
                    for (var pair of formData.entries()) {
                      url.searchParams.set(pair[0], pair[1]);
                    }
                    
                    var actualUrl = url.toString();
                    if (actualUrl.includes('/api/proxy?url=')) {
                      try {
                        var urlParam = actualUrl.split('/api/proxy?url=')[1];
                        actualUrl = decodeURIComponent(urlParam);
                      } catch (urlError) {
                        console.log('Failed to extract URL from proxy:', urlError);
                      }
                    }
                    
                    // Send navigation message to parent window
                    try {
                      window.parent.postMessage({
                        type: 'navigate',
                        url: actualUrl
                      }, '*');
                    } catch (msgError) {
                      console.log('Failed to send navigation message:', msgError);
                    }
                  }
                }
              } catch (submitError) {
                console.log('Form submit handling error:', submitError);
              }
            }, true);
            
            // Send page title to parent window
            function sendTitleToParent() {
              try {
                var title = document.title || document.querySelector('title')?.textContent || window.location.hostname;
                window.parent.postMessage({
                  type: 'title',
                  title: title
                }, '*');
              } catch (titleError) {
                console.log('Failed to send title:', titleError);
              }
            }
            
            // Send title immediately and watch for changes
            sendTitleToParent();
            
            // Send current URL to parent (in case of redirects)
            function sendUrlToParent() {
              try {
                var currentUrl = ORIGINAL_BASE;
                window.parent.postMessage({
                  type: 'url-update',
                  url: currentUrl
                }, '*');
              } catch (urlError) {
                console.log('Failed to send URL update:', urlError);
              }
            }
            
            // Send URL update on load
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', sendUrlToParent);
            } else {
              sendUrlToParent();
            }
            
            // Watch for title changes
            var titleObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
                  sendTitleToParent();
                }
              });
            });
            
            var titleElement = document.querySelector('title');
            if (titleElement) {
              titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
            }
            
            // Also watch for document title property changes
            var originalTitle = document.title;
            Object.defineProperty(document, 'title', {
              get: function() { return originalTitle; },
              set: function(newTitle) {
                originalTitle = newTitle;
                sendTitleToParent();
              }
            });
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
            // Hook form submissions
            var _submit = HTMLFormElement.prototype.submit;
            HTMLFormElement.prototype.submit = function(){
              try {
                if (this.action && !/^\/api\/proxy\?url=/.test(this.action)) {
                  var targetUrl;
                  if (/^https?:\/\//.test(this.action)) {
                    try {
                      var parsed = new URL(this.action, window.location.href);
                      if (parsed.origin === window.location.origin) {
                        var pathAndQuery = parsed.pathname + parsed.search + parsed.hash;
                        targetUrl = new URL(pathAndQuery, ORIGINAL_BASE).toString();
                      } else {
                        targetUrl = this.action;
                      }
                    } catch(e) { targetUrl = this.action; }
                  } else {
                    targetUrl = abs(this.action);
                  }
                  this.action = PROXY_ENDPOINT + encodeURIComponent(targetUrl);
                }
              } catch(e) {}
              return _submit.apply(this, arguments);
            };
            // Hook form submit events
            document.addEventListener('submit', function(e) {
              try {
                var form = e.target;
                if (form && form.action && !/^\/api\/proxy\?url=/.test(form.action)) {
                  var targetUrl;
                  if (/^https?:\/\//.test(form.action)) {
                    try {
                      var parsed = new URL(form.action, window.location.href);
                      if (parsed.origin === window.location.origin) {
                        var pathAndQuery = parsed.pathname + parsed.search + parsed.hash;
                        targetUrl = new URL(pathAndQuery, ORIGINAL_BASE).toString();
                      } else {
                        targetUrl = form.action;
                      }
                    } catch(e) { targetUrl = form.action; }
                  } else {
                    targetUrl = abs(form.action);
                  }
                  form.action = PROXY_ENDPOINT + encodeURIComponent(targetUrl);
                }
              } catch(e) {}
            }, true);
            // Neutralize attempts to access top/document across sandboxes
            try { Object.defineProperty(window, 'crossOriginIsolated', { get: function(){ return false; } }); } catch(e) {}
            
            // Detect if we're being blocked and notify parent
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('blocked') || e.message.includes('X-Frame-Options'))) {
                try {
                  window.parent.postMessage({
                    type: 'error',
                    message: 'This page has been blocked by Chrome security policies.'
                  }, '*');
                } catch(err) {}
              }
            });
            
            // Check for frame-busting attempts
            if (window.top !== window.self) {
              try {
                if (window.top.location.href !== window.location.href) {
                  // We're in a frame, which is what we want
                }
              } catch(e) {
                // If we can't access top.location, we might be blocked
                try {
                  window.parent.postMessage({
                    type: 'error',
                    message: 'Content blocked due to security restrictions.'
                  }, '*');
                } catch(err) {}
              }
            }
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
      const targetDomain = new URL(target).origin;
      
      // First, rewrite absolute URLs that match the target domain
      let rewritten = cssText.replace(
        new RegExp(`url\\(["']?${targetDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)["']?\\)`, 'gi'),
        (_match, path) => {
          try {
            const fullUrl = targetDomain + path;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `url("${proxied}")`;
          } catch (e) {
            return _match;
          }
        }
      );
      
      // Then rewrite relative URLs
      rewritten = rewritten.replace(
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
      // Best-effort: rewrite obvious URL patterns in JS to avoid breaking code
      const js = await response.text();
      const targetDomain = new URL(target).origin;
      
      // Rewrite absolute URLs that match the target domain in fetch() calls
      let rewritten = js.replace(
        new RegExp(`fetch\\(["']${targetDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)["']`, 'gi'),
        (_match, path) => {
          try {
            const fullUrl = targetDomain + path;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `fetch("${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );
      
      // Rewrite XMLHttpRequest open() calls
      rewritten = rewritten.replace(
        new RegExp(`\.open\\(["']\\w+["'],\\s*["']${targetDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^"']*)["']`, 'gi'),
        (_match, path) => {
          try {
            const fullUrl = targetDomain + path;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `.open("GET", "${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );
      
      res.setHeader('Content-Type', contentType || 'application/javascript; charset=utf-8');
      res.send(rewritten);
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
    console.error('Proxy error:', {
      message: err.message,
      code: err.code,
      cause: err.cause,
      target: target,
      userAgent: req.headers['user-agent']
    });
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (err.code === 'UND_ERR_INVALID_ARG') {
      errorMessage = 'Invalid request parameters';
    } else if (err.name === 'TypeError' && err.message.includes('fetch failed')) {
      errorMessage = 'Network request failed - the target site may be unreachable';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ 
      error: `Proxy fetch failed: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? {
        code: err.code,
        cause: err.cause?.message,
        target: target
      } : undefined
    });
  }
}
