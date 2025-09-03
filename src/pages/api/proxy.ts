import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let target = req.query.url as string;

  if (typeof target === 'string') {
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
    target = cur.replace(/&amp;/gi, '&')
                .replace(/&lt;/gi, '<')
                .replace(/&gt;/gi, '>')
                .replace(/&quot;/gi, '"')
                .replace(/&apos;/gi, "'");
  }
  
  if (!target) {
    if (req.query.q || req.query.search) {
      const searchQuery = req.query.q || req.query.search;
      target = `https://www.bing.com/search?q=${encodeURIComponent(searchQuery as string)}`;
    } else if (Object.keys(req.query).length > 0) {
      const queryString = new URLSearchParams(req.query as any).toString();
      target = `https://www.bing.com/search?${queryString}`;
    } else {
      res.status(400).json({ error: 'Missing url param' });
      return;
    }
  }

  try {
    const parsedUrl = new URL(target);
    if (/\.google\./i.test(parsedUrl.hostname)) {
      const q = parsedUrl.searchParams.get('q');
      if (q) {
        res.writeHead(302, { Location: `https://www.bing.com/search?q=${encodeURIComponent(q)}` });
        res.end();
        return;
      } else {
        res.writeHead(302, { Location: 'https://www.bing.com/' });
        res.end();
        return;
      }
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

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
    const headers: HeadersInit = {
      'User-Agent':
        req.headers['user-agent'] ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36',
      'Accept-Encoding': 'identity',
    };
    
    const allowedHeaders = ['accept', 'accept-language', 'referer', 'cookie', 'origin', 'dnt'];
    allowedHeaders.forEach(header => {
      if (req.headers[header]) headers[header] = req.headers[header] as string;
    });
    
    if (target.includes('bing.com') || target.includes('google.com')) {
      headers['Sec-Fetch-Dest'] = 'document';
      headers['Sec-Fetch-Mode'] = 'navigate';
      headers['Sec-Fetch-Site'] = 'cross-site';
      headers['Sec-Fetch-User'] = '?1';
      headers['Upgrade-Insecure-Requests'] = '1';
    }
    
    if (target.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf)$/i)) {
      headers['Accept'] = 'image/*, */*';
    }

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
    
    Object.keys(req.headers).forEach((key) => {
      if (!blockedHeaders.includes(key.toLowerCase()) && !headers[key]) {
        headers[key] = req.headers[key] as string;
      }
    });

    if (req.headers['cookie']) {
      headers['Cookie'] = req.headers['cookie'] as string;
    }

    const response = await fetch(target, { 
      headers,
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

    const contentType = response.headers.get('content-type') || '';
    const lowerCT = contentType.toLowerCase();
    const isHTML = lowerCT.includes('text/html');
    const isCSS = lowerCT.includes('text/css');
    const isJS = lowerCT.includes('application/javascript') || lowerCT.includes('text/javascript');

    if (isHTML) {
      let body = await response.text();

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

      body = body.replace(
        /(href|src)=["'](\/\/[^"']+)["']/gi,
        (_match, attr, restWithSlashes) => {
          try {
            const fullUrl = `https://${restWithSlashes.replace(/^\/\//, '')}`;
            const proxied = `/api/proxy?url=${encodeURIComponent(fullUrl)}`;
            return `${attr}="${proxied}"`;
          } catch (e) {
            return _match;
          }
        }
      );

      body = body.replace(
        /(href|src)=["'](?!https?:\/\/|data:|\/api\/proxy)([^"']+)["']/gi,
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

      body = body.replace(
        /(srcset)=\["']([^"']+)\["']/gi,
        (_m, attr, value) => {
          try {
            const rewritten = value
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
            return `${attr}="${rewritten}"`;
          } catch {
            return `${attr}="${value}"`;
          }
        }
      );

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

      body = body.replace(
        /(url\(["']?)(?!https?:\/\/|data:|\/api\/proxy)(.*?)(["']?\))/gi,
        (match, prefix, relUrl, suffix) => {
          try {
            const cleanUrl = relUrl.replace(/['"]/g, '');
            const absoluteUrl = new URL(cleanUrl, target).toString();
            const proxied = `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            return `${prefix}${proxied}${suffix}`;
          } catch (e) {
            return match;
          }
        }
      );

      body = body.replace(
        /<script\b[^>]*\bonload\s*=\s*["'][^"']*["'][^>]*>.*?<\/script>/gi, 
        ''
      );

      body = body.replace(
        /history\.(pushState|replaceState|back|forward)/gi, 
        '/* removed history manipulation */'
      );

      body = body.replace(
        /(if\s*\(\s*self\s*!=\s*top\s*\)|if\s*\(\s*top\s*!=\s*self\s*\)|if\s*\(\s*window\s*!=\s*top\s*\)|if\s*\(\s*top\s*!=\s*window\s*\))[^}]*}/gi,
        '/* removed frame busting */'
      );

      if (/google\\.com refused to connect|X-Frame-Options|blocked by Chrome security policies/i.test(body)) {
        body = `<div style="font-family:sans-serif;text-align:center;padding:3em"><h2>Google search is blocked in this browser.</h2><p>Try <a href='https://www.bing.com/search?q=' target='_self'>Bing Search</a> instead.</p></div>`;
      }

      body = body.replace(
        /(top\.location\s*=|top\.location\.href\s*=|window\.top\.location\s*=)/gi,
        '/* removed frame busting redirect */'
      );

      body = body.replace(
        /<meta[^>]*http-equiv\s*=\s*["']X-Frame-Options["'][^>]*>/gi,
        ''
      );

      body = body.replace(/\s+integrity=["'][^"']+["']/gi, '');
      body = body.replace(/\starget=["']_blank["']/gi, ' target="_self"');
      body = body.replace(/\starget=["']_new["']/gi, ' target="_self"');

      const shim = `
        <script>(function(){
          try {
            var PROXY_ENDPOINT = '/api/proxy?url=';
            var ORIGINAL_BASE = ${JSON.stringify(target)};
            var abs = function(u) {
              try {
                const url = new URL(u, ORIGINAL_BASE);
                return url.toString();
              } catch (e) {
                console.warn('Failed to resolve URL:', u, e);
                return u;
              }
            };
            
            // Intercept all click events for better coverage
            document.addEventListener('click', function(e) {
              try {
                let el = e.target;
                while (el && el.tagName !== 'A' && el.parentElement) {
                  el = el.parentElement;
                }
                if (el && el.tagName === 'A' && el.href) {
                  const href = el.getAttribute('href') || el.href;
                  if (/^(javascript:|mailto:|tel:|#)/i.test(href)) {
                    console.log('Skipping special link:', href);
                    return;
                  }
                  if (el.target === '_blank' || el.target === '_new') {
                    console.log('Skipping new window link:', href);
                    return;
                  }
                  if (e.ctrlKey || e.metaKey) {
                    console.log('Skipping modified click:', href);
                    return;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  let absUrl = href;
                  try {
                    absUrl = new URL(href, ORIGINAL_BASE).toString();
                  } catch (err) {
                    console.warn('URL parsing failed:', href, err);
                  }
                  try {
                    window.parent.postMessage({
                      type: 'navigate',
                      url: absUrl
                    }, '*');
                    console.log('Sent navigation message for:', absUrl);
                  } catch (msgError) {
                    console.warn('postMessage failed, falling back to direct navigation:', absUrl, msgError);
                    const proxied = PROXY_ENDPOINT + encodeURIComponent(absUrl);
                    window.location.href = proxied;
                  }
                }
              } catch (clickError) {
                console.error('Link click handling error:', clickError);
                window.parent.postMessage({
                  type: 'error',
                  message: 'Failed to handle link click: ' + clickError.message
                }, '*');
              }
            }, true);
            
            // Handle form submissions
            document.addEventListener('submit', function(e) {
              try {
                const form = e.target;
                if (form && form.tagName === 'FORM') {
                  if (form.target === '_blank' || form.target === '_new') {
                    console.log('Skipping form with target _blank/_new');
                    return;
                  }
                  if (!form.method || form.method.toLowerCase() === 'get') {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const url = new URL(form.action || ORIGINAL_BASE);
                    for (const [key, value] of formData.entries()) {
                      url.searchParams.set(key, value);
                    }
                    const actualUrl = url.toString();
                    try {
                      window.parent.postMessage({
                        type: 'navigate',
                        url: actualUrl
                      }, '*');
                      console.log('Sent form navigation message for:', actualUrl);
                    } catch (msgError) {
                      console.warn('Form postMessage failed, falling back:', actualUrl, msgError);
                      const proxied = PROXY_ENDPOINT + encodeURIComponent(actualUrl);
                      window.location.href = proxied;
                    }
                  } else {
                    // Handle POST forms by proxying the request
                    const formData = new FormData(form);
                    const actionUrl = abs(form.action || ORIGINAL_BASE);
                    const proxied = PROXY_ENDPOINT + encodeURIComponent(actionUrl);
                    form.action = proxied;
                    console.log('Proxied POST form action:', proxied);
                  }
                }
              } catch (submitError) {
                console.error('Form submit handling error:', submitError);
                window.parent.postMessage({
                  type: 'error',
                  message: 'Failed to handle form submission: ' + submitError.message
                }, '*');
              }
            }, true);
            
            // Send page title
            function sendTitleToParent() {
              try {
                const title = document.title || document.querySelector('title')?.textContent || window.location.hostname;
                window.parent.postMessage({
                  type: 'title',
                  title: title
                }, '*');
                console.log('Sent title:', title);
              } catch (titleError) {
                console.error('Failed to send title:', titleError);
              }
            }
            
            sendTitleToParent();
            
            // Send current URL
            function sendUrlToParent() {
              try {
                const currentUrl = window.location.href.includes('/api/proxy?url=') 
                  ? decodeURIComponent(window.location.href.split('/api/proxy?url=')[1])
                  : ORIGINAL_BASE;
                window.parent.postMessage({
                  type: 'url-update',
                  url: currentUrl
                }, '*');
                console.log('Sent URL update:', currentUrl);
              } catch (urlError) {
                console.error('Failed to send URL update:', urlError);
              }
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', sendUrlToParent);
            } else {
              sendUrlToParent();
            }
            
            const titleObserver = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {
                  sendTitleToParent();
                }
              });
            });
            
            const titleElement = document.querySelector('title');
            if (titleElement) {
              titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
            }
            
            let originalTitle = document.title;
            Object.defineProperty(document, 'title', {
              get: function() { return originalTitle; },
              set: function(newTitle) {
                originalTitle = newTitle;
                sendTitleToParent();
              }
            });

            // Hook fetch
            const _fetch = window.fetch;
            window.fetch = function(input, init) {
              try {
                let url = (typeof input === 'string') ? input : (input && input.url) ? input.url : String(input);
                if (!/^data:|^blob:|^about:/.test(url) && !/^\/api\/proxy\?url=/.test(url)) {
                  url = abs(url);
                  input = PROXY_ENDPOINT + encodeURIComponent(url);
                }
                console.log('Proxied fetch:', url);
              } catch (e) {
                console.warn('Fetch URL processing failed:', e);
              }
              return _fetch.apply(this, [input, init]);
            };

            // Hook XMLHttpRequest
            const _open = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
              try {
                if (typeof url === 'string' && !/^data:|^blob:|^about:/.test(url) && !/^\/api\/proxy\?url=/.test(url)) {
                  url = abs(url);
                  url = PROXY_ENDPOINT + encodeURIComponent(url);
                }
                console.log('Proxied XHR:', url);
              } catch (e) {
                console.warn('XHR URL processing failed:', e);
              }
              return _open.apply(this, [method, url].concat([].slice.call(arguments, 2)));
            };

            // Hook form actions
            const _submit = HTMLFormElement.prototype.submit;
            HTMLFormElement.prototype.submit = function() {
              try {
                if (this.action && !/^\/api\/proxy\?url=/.test(this.action)) {
                  const targetUrl = abs(this.action);
                  this.action = PROXY_ENDPOINT + encodeURIComponent(targetUrl);
                  console.log('Proxied form submit:', targetUrl);
                }
              } catch (e) {
                console.warn('Form submit URL processing failed:', e);
              }
              return _submit.apply(this, arguments);
            };

            // Neutralize frame-busting attempts
            try {
              Object.defineProperty(window, 'crossOriginIsolated', { get: function() { return false; } });
              Object.defineProperty(window, 'top', { get: function() { return window; } });
              Object.defineProperty(window, 'parent', { get: function() { return window; } });
            } catch (e) {
              console.warn('Failed to neutralize frame-busting:', e);
            }

            // Detect and report errors
            window.addEventListener('error', function(e) {
              if (e.message && (e.message.includes('blocked') || e.message.includes('X-Frame-Options'))) {
                try {
                  window.parent.postMessage({
                    type: 'error',
                    message: 'Content blocked by browser security policies.'
                  }, '*');
                  console.error('Blocked by security policies:', e.message);
                } catch (err) {
                  console.error('Failed to report blocking error:', err);
                }
              }
            });

            // Monitor DOM for dynamic links
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                  mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                      const links = (node as Element).querySelectorAll('a[href]');
                      links.forEach((link) => {
                        const href = link.getAttribute('href');
                        if (href && !/^(javascript:|mailto:|tel:|#)/i.test(href) && !/^\/api\/proxy\?url=/.test(href)) {
                          try {
                            const absUrl = abs(href);
                            link.setAttribute('href', PROXY_ENDPOINT + encodeURIComponent(absUrl));
                            console.log('Rewrote dynamic link:', absUrl);
                          } catch (e) {
                            console.warn('Failed to rewrite dynamic link:', href, e);
                          }
                        }
                      });
                    }
                  });
                }
              });
            });
            observer.observe(document.body, { childList: true, subtree: true });
          } catch (e) {
            console.error('Shim initialization error:', e);
            window.parent.postMessage({
              type: 'error',
              message: 'Shim initialization failed: ' + e.message
            }, '*');
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
      const cssText = await response.text();
      const targetDomain = new URL(target).origin;
      
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
      const js = await response.text();
      const targetDomain = new URL(target).origin;
      
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
      try {
        const isBinaryFile = /\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf|pdf|zip)$/i.test(target) || 
                            contentType.includes('image/') || 
                            contentType.includes('font/') || 
                            contentType.includes('application/font') ||
                            contentType.includes('application/octet-stream');

        if (isBinaryFile) {
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=86400');
          const contentLength = response.headers.get('content-length');
          if (contentLength) res.setHeader('Content-Length', contentLength);
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          res.send(buffer);
        } else {
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