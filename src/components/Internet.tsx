import { useState, useEffect, useRef, useCallback } from 'react';
import { FaGithub, FaLinkedin, FaGlobe } from 'react-icons/fa';

interface Tab {
  id: string;
  url: string;
  title: string;
  isActive: boolean;
  favicon?: string;
}

interface Bookmark {
  title: string;
  url: string;
  favicon?: string;
}

interface HistoryEntry {
  url: string;
  title: string;
  timestamp: number;
  favicon?: string;
}

interface InternetProps {
  onClose?: () => void;
  // Allow parent container to start a drag when the titlebar is grabbed
  onDragHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  // Let parent (InternetTerminal) toggle maximize on green button
  onToggleMaximize?: () => void;
}

export function Internet({ onClose, onDragHandlePointerDown, onToggleMaximize }: InternetProps) {
  const [tabs, setTabs] = useState<Tab[]>([{ 
    id: '1', 
    url: 'https://apple.com', 
    title: 'Apple', 
    isActive: true, 
    favicon: '/api/proxy?url=https://www.apple.com/favicon.ico' 
  }]);
  const [currentUrl, setCurrentUrl] = useState('https://apple.com');
  const [urlInput, setUrlInput] = useState('https://apple.com');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [navigationIndex, setNavigationIndex] = useState(-1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [titleTimeoutId, setTitleTimeoutId] = useState<NodeJS.Timeout | null>(null);
  // Suggestions/state for address bar
  const [filteredSuggestions, setFilteredSuggestions] = useState<Array<{ title: string; url: string; type?: 'search' | 'history' | 'bookmark' }>>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isUrlDropdownOpen, setIsUrlDropdownOpen] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Helper to map a canonical external URL to our local proxy endpoint
  const toProxy = (u: string) => `/api/proxy?url=${encodeURIComponent(u)}`;
  const isProxied = (u: string) => typeof u === 'string' && (u.startsWith('/api/proxy?url=') || u.includes('/api/proxy?url='));
  const unwrapProxied = (u: string) => {
    try {
      if (u.startsWith('/api/proxy?url=')) {
        const raw = decodeURIComponent(u.replace('/api/proxy?url=', ''));
        return raw;
      }
      // absolute same-origin URLs
      const parsed = new URL(u, window.location.origin);
      if (parsed.pathname === '/api/proxy' && parsed.searchParams.get('url')) {
        return parsed.searchParams.get('url') as string;
      }
    } catch {}
    return u;
  };

  // URL helpers and search integration
  const stripProtocol = (url: string) => url.replace(/^(https?:\/\/|ftp:\/\/)/i, "");
  const normalizeUrlInline = (url: string) => url
    .trim()
    .toLowerCase()
    .replace(/^(https?:\/\/|ftp:\/\/)/i, "")
    .replace(/\/$/g, "")
    .replace(/^www\./i, "");
  const isValidUrl = (input: string) => {
    const s = input.trim();
    if (!s) return false;
    
    // Already has a protocol
    if (/^https?:\/\//i.test(s)) return true;
    
    // Local URLs and IPs
    if (/^localhost(:\d+)?(\/|$)/i.test(s)) return true;
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/|$)?$/.test(s)) return true; // IPv4
    
    // Domain-like URLs (including single-word domains like "apple")
    return /^[a-z0-9-]+(\.[a-z0-9-]+)*(:\d+)?(\/|$)?$/i.test(s);
  };

  const handleSearch = (query: string) => {
    // Make sure the query isn't empty
    if (!query.trim()) return;
    
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    navigateToUrl(searchUrl);
  };

  const handleFilterSuggestions = (inputValue: string) => {
    const normalizedInput = normalizeUrlInline(inputValue);
    const matchesBookmark = bookmarks
      .map(b => ({
        title: b.title || b.url,
        url: b.url,
        type: 'bookmark' as const
      }))
      .filter(b =>
        b.title.toLowerCase().includes(normalizedInput) ||
        normalizeUrlInline(b.url).includes(normalizedInput)
      );

    const matchesHistory = history
      .slice(0, 50)
      .map(h => ({ title: h.title || h.url, url: h.url, type: 'history' as const }))
      .filter(h =>
        (h.title || '').toLowerCase().includes(normalizedInput) ||
        normalizeUrlInline(h.url).includes(normalizedInput)
      );

    const suggestions: Array<{ title: string; url: string; type?: 'search' | 'history' | 'bookmark' }> = [
      ...matchesBookmark,
      ...matchesHistory
    ];

    if (!isValidUrl(inputValue) && inputValue.trim().length > 0) {
      suggestions.push({ title: `Search "${inputValue}"`, url: `bing:${inputValue}`, type: 'search' });
    }

    setFilteredSuggestions(suggestions);
    setSelectedSuggestionIndex(0);
  };

  const handleNavigateFromSuggestion = (s: { title: string; url: string; type?: 'search' | 'history' | 'bookmark' }) => {
    if (s.type === 'search') {
      const q = s.url.replace(/^bing:/i, '').trim();
      handleSearch(q);
    } else {
      navigateToUrl(s.url);
    }
    setIsUrlDropdownOpen(false);
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('ie-bookmarks');
    const savedHistory = localStorage.getItem('ie-history');
    const savedTabs = localStorage.getItem('ie-tabs');

    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
        initializeDefaultBookmarks();
      }
    } else {
      initializeDefaultBookmarks();
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }

    if (savedTabs) {
      try {
        const parsedTabs = JSON.parse(savedTabs);
        setTabs(parsedTabs);
        const activeTab = parsedTabs.find((tab: Tab) => tab.isActive);
        if (activeTab) {
          setCurrentUrl(activeTab.url);
          setUrlInput(formatUrlForDisplay(activeTab.url));
        }
      } catch (e) {
        console.error('Failed to parse tabs:', e);
      }
    }
    
    // Initialize with apple.com navigation
    setTimeout(() => navigateToUrl('apple.com'), 100);
  }, []);

  const initializeDefaultBookmarks = () => {
    // Restrict to the three requested bookmarks (also reused on the new-tab grid)
    const defaultBookmarks: Bookmark[] = [
      { title: 'advay.ca', url: 'https://advay.ca', favicon: '/favicon.png' },
      { title: 'github', url: 'https://github.com/advayc', favicon: '/api/proxy?url=https://github.com/favicon.ico' },
      { title: 'linkedin', url: 'https://www.linkedin.com/in/advay/', favicon: '/api/proxy?url=https://www.linkedin.com/favicon.ico' },
    ];
    setBookmarks(defaultBookmarks);
    localStorage.setItem('ie-bookmarks', JSON.stringify(defaultBookmarks));
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (titleTimeoutId) {
        clearTimeout(titleTimeoutId);
      }
    };
  }, [titleTimeoutId]);

  useEffect(() => {
    localStorage.setItem('ie-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ie-tabs', JSON.stringify(tabs));
  }, [tabs]);


  // Always show full URL (with protocol)
  const formatUrlForDisplay = (url: string) => {
    try {
      return url.replace(/^https?:\/\//i, '');
    } catch {
      return url;
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            refresh();
            break;
          case 't':
            e.preventDefault();
            createNewTab();
            break;
          case 'w':
            e.preventDefault();
            const activeTab = tabs.find(tab => tab.isActive);
            if (activeTab && tabs.length > 1) {
              closeTab(activeTab.id);
            }
            break;
          case 'l':
            e.preventDefault();
            urlInputRef.current?.focus();
            urlInputRef.current?.select();
            break;
        }
      }
      
      switch (e.key) {
        case 'F5':
          e.preventDefault();
          refresh();
          break;
        case 'Escape':
          if (isLoading) {
            e.preventDefault();
            stopLoading();
          }
          break;
      }
    };

    // Message handler for iframe communication
    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === 'object') {
          switch (event.data.type) {
            case 'navigate':
              if (event.data.url) {
                console.log('Received navigation message:', event.data.url);
                navigateToUrl(event.data.url);
              }
              break;
            case 'url-update':
              if (event.data.url) {
                console.log('Received URL update:', event.data.url);
                // Update URL bar without navigating (useful for redirects)
                setCurrentUrl(event.data.url);
                setUrlInput(formatUrlForDisplay(event.data.url));
                setTabs(prevTabs => 
                  prevTabs.map(tab => 
                    tab.isActive 
                      ? { ...tab, url: event.data.url }
                      : tab
                  )
                );
              }
              break;
            case 'error':
              console.error('Iframe reported error:', event.data.message);
              setLastError(event.data.message);
              break;
            case 'title':
              if (event.data.title) {
                console.log('Received title update:', event.data.title);
                // Clear the title timeout since we received a title
                if (titleTimeoutId) {
                  clearTimeout(titleTimeoutId);
                  setTitleTimeoutId(null);
                }
                setTabs(prevTabs => 
                  prevTabs.map(tab => 
                    tab.isActive 
                      ? { ...tab, title: event.data.title }
                      : tab
                  )
                );
                // Also update history entry
                setHistory(prevHistory => 
                  prevHistory.map((entry, index) => 
                    index === 0 ? { ...entry, title: event.data.title } : entry
                  )
                );
              }
              break;
          }
        }
      } catch (error) {
        console.error('Message handling error:', error);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('message', handleMessage);
    };
  }, [tabs, isLoading]);

  const navigateToUrl = useCallback((url: string) => {
    if (!url) return;
    
    // Reset retry count and error state for new navigation
    setRetryCount(0);
    setLastError(null);
    
    // If URL is already proxied, unwrap for state but keep proxied for iframe src
    const alreadyProxied = isProxied(url);
    if (alreadyProxied) {
      url = unwrapProxied(url);
    }

    // Add protocol if missing and handle bing: query marker
    let fullUrl = url;
    if (/^bing:/i.test(url)) {
      const q = url.replace(/^bing:/i, '').trim();
      fullUrl = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it's a search query or a URL
      if (!isValidUrl(url)) {
        fullUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
      } else {
        fullUrl = `https://${url}`;
      }
    }

  // If navigating to Bing, add parameters to reduce frame busting
    try {
      const u = new URL(fullUrl);
      const host = u.hostname;
      const isBing = /(^|\.)bing\.(com|ca|co\.[a-z]{2}|[a-z]{2})$/i.test(host);
      if (isBing) {
        // Add parameters that help with iframe embedding
        if (!u.searchParams.has('FORM')) {
          u.searchParams.set('FORM', 'QBRE');
        }
        fullUrl = u.toString();
      }
    } catch {
      /* ignore parse issues */
    }

    setIsLoading(true);
  setCurrentUrl(fullUrl);
  setUrlInput(fullUrl);

    // Update navigation history
    const newHistory = [...navigationHistory.slice(0, navigationIndex + 1), fullUrl];
    setNavigationHistory(newHistory);
    setNavigationIndex(newHistory.length - 1);
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);

    // Clear any existing title timeout
    if (titleTimeoutId) {
      clearTimeout(titleTimeoutId);
    }

    // Update active tab
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.isActive 
          ? { ...tab, url: fullUrl, title: 'Loading...' }
          : tab
      )
    );

    // Set a timeout to update title with a fallback if iframe doesn't send title
    const timeoutId = setTimeout(() => {
      try {
        const hostname = new URL(fullUrl).hostname;
        const fallbackTitle = hostname || 'Untitled Page';
        setTabs(prevTabs => 
          prevTabs.map(tab => 
            tab.isActive && tab.title === 'Loading...'
              ? { ...tab, title: fallbackTitle }
              : tab
          )
        );
        // Also update history entry
        setHistory(prevHistory => 
          prevHistory.map((entry, index) => 
            index === 0 && entry.title === 'Loading...' ? { ...entry, title: fallbackTitle } : entry
          )
        );
      } catch (error) {
        console.error('Failed to set fallback title:', error);
      }
    }, 3000); // 3 second timeout
    
    setTitleTimeoutId(timeoutId);

    // Use proxy for external URLs
    const proxiedUrl = alreadyProxied ? (typeof window !== 'undefined' ? toProxy(fullUrl) : toProxy(fullUrl)) : toProxy(fullUrl);
    
    if (iframeRef.current) {
      // If caller provided a proxied path, use that directly; else use constructed proxiedUrl
      iframeRef.current.src = alreadyProxied ? `/api/proxy?url=${encodeURIComponent(fullUrl)}` : proxiedUrl;
    }

    // Add to history
    const historyEntry: HistoryEntry = {
      url: fullUrl,
      title: 'Loading...',
      timestamp: Date.now(),
      favicon: `https://icon.horse/icon/${new URL(fullUrl).hostname}`
    };
    setHistory(prevHistory => [historyEntry, ...prevHistory.slice(0, 99)]);
  }, [navigationHistory, navigationIndex]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setRetryCount(0); // Reset retry count on successful load
    setLastError(null); // Clear any previous errors

    // Clear title timeout since page loaded
    if (titleTimeoutId) {
      clearTimeout(titleTimeoutId);
      setTitleTimeoutId(null);
    }

    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const title = iframe.contentDocument.title || formatUrlForDisplay(currentUrl);
        const hostname = new URL(currentUrl).hostname;
        const favicon = `https://icon.horse/icon/${hostname}` || '/icons/default_favicon.png';
        
        // Update tab title
        setTabs(prevTabs => 
          prevTabs.map(tab => 
            tab.isActive 
              ? { ...tab, title, favicon }
              : tab
          )
        );
        
        // Update history entry
        setHistory(prevHistory => 
          prevHistory.map((entry, index) => 
            index === 0 ? { ...entry, title, favicon } : entry
          )
        );
      } else {
        // Fallback: try to get hostname for title
        try {
          const hostname = new URL(currentUrl).hostname;
          const fallbackTitle = hostname || 'Untitled Page';
          setTabs(prevTabs => 
            prevTabs.map(tab => 
              tab.isActive && (tab.title === 'Loading...' || !tab.title)
                ? { ...tab, title: fallbackTitle }
                : tab
            )
          );
        } catch (error) {
          console.error('Failed to set fallback title:', error);
        }
      }
    } catch (error) {
      console.error('Failed to access iframe content:', error);
      setIsLoading(false);
      setLastError('Failed to load content.');
    }
  };  const handleIframeError = () => {
    setIsLoading(false);
    
    // Check if it's a Chrome blocking issue
    const isBlocked = lastError?.includes('blocked') || 
                     lastError?.includes('X-Frame-Options') ||
                     lastError?.includes('refused to connect');
    
    if (isBlocked) {
      setLastError(`This page has been blocked by the browser. Try opening "${currentUrl}" in a new tab instead.`);
    } else {
      setLastError(`Failed to load: ${currentUrl}`);
    }
    
    console.error('Failed to load page:', currentUrl);
    
    // Auto-retry up to 2 times with a delay for non-blocking errors
    if (retryCount < 2 && !isBlocked) {
      console.log(`Retrying... attempt ${retryCount + 1}`);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        if (iframeRef.current) {
          // Add cache busting parameter to force reload
          const separator = currentUrl.includes('?') ? '&' : '?';
          iframeRef.current.src = toProxy(currentUrl) + separator + '_retry=' + Date.now();
        }
      }, 1000 * (retryCount + 1)); // Exponential backoff
    } else {
      console.error('Max retries reached for:', currentUrl);
    }
  };

  const goBack = () => {
    if (canGoBack) {
      const newIndex = navigationIndex - 1;
      setNavigationIndex(newIndex);
      const url = navigationHistory[newIndex];
      setCurrentUrl(url);
      setUrlInput(formatUrlForDisplay(url));
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      setIsLoading(true);
      
      if (iframeRef.current) {
        iframeRef.current.src = toProxy(url);
      }
    }
  };

  const goForward = () => {
    if (canGoForward) {
      const newIndex = navigationIndex + 1;
      setNavigationIndex(newIndex);
      const url = navigationHistory[newIndex];
      setCurrentUrl(url);
      setUrlInput(formatUrlForDisplay(url));
      setCanGoBack(true);
      setCanGoForward(newIndex < navigationHistory.length - 1);
      setIsLoading(true);
      
      if (iframeRef.current) {
        iframeRef.current.src = toProxy(url);
      }
    }
  };

  const refresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = toProxy(currentUrl) + '&_t=' + Date.now();
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  };

  const createNewTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      url: 'about:blank',
      title: 'New Tab',
      isActive: true,
      favicon: undefined
    };
    
    setTabs(prevTabs => [
      ...prevTabs.map(tab => ({ ...tab, isActive: false })),
      newTab
    ]);
    
    setCurrentUrl('about:blank');
    setUrlInput('');
    setIsLoading(false);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = tabs[tabIndex].isActive;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    
    if (isActiveTab && newTabs.length > 0) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      newTabs[newActiveIndex].isActive = true;
  setCurrentUrl(newTabs[newActiveIndex].url);
  setUrlInput(newTabs[newActiveIndex].url);
    }
    
    setTabs(newTabs);
  };

  const switchTab = (tabId: string) => {
    const newTabs = tabs.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    }));
    
    const activeTab = newTabs.find(tab => tab.isActive);
    if (activeTab) {
  setCurrentUrl(activeTab.url);
  setUrlInput(activeTab.url);
      setTabs(newTabs);
      
      if (activeTab.url !== 'about:blank') {
        setIsLoading(true);
        if (iframeRef.current) {
          iframeRef.current.src = toProxy(activeTab.url);
        }
      }
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = urlInput.trim();
    if (!trimmedInput) return;
    if (filteredSuggestions.length > 0 && isUrlDropdownOpen) {
      handleNavigateFromSuggestion(filteredSuggestions[selectedSuggestionIndex]);
      return;
    }
    let url: string;
    try {
      // Try to create a URL - if it fails, treat as search or domain
      new URL(trimmedInput);
      url = trimmedInput;
    } catch {
      // Check if it's a domain-like string (contains dots or is a common domain)
      if (trimmedInput.includes('.') || /^[a-z0-9-]+$/i.test(trimmedInput)) {
        // Add https:// if missing
        if (!trimmedInput.startsWith('http://') && !trimmedInput.startsWith('https://')) {
          url = `https://${trimmedInput}`;
        } else {
          url = trimmedInput;
        }
      } else {
        // Treat as search query
        url = `https://www.bing.com/search?q=${encodeURIComponent(trimmedInput)}`;
      }
    }
    navigateToUrl(url);
  };

  const addBookmark = () => {
    if (currentUrl && currentUrl !== 'about:blank') {
      const activeTab = tabs.find(tab => tab.isActive);
      const newBookmark: Bookmark = {
        title: activeTab?.title || formatUrlForDisplay(currentUrl),
        url: currentUrl,
        favicon: activeTab?.favicon
      };
      
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{
        background:
          'repeating-linear-gradient(0deg, #f7f7f7 0px, #f7f7f7 2px, #d2d2d2 2.5px, #f7f7f7 4px)',
        fontFamily: 'Geneva-12, ArkPixel, SerenityOS-Emoji, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Aqua-style window title bar with glossy traffic lights and pinstripes */}
      <div
        className="relative border-b border-[#a7a7a7] px-3 py-[6px] flex items-center justify-between cursor-move select-none"
        onPointerDown={onDragHandlePointerDown}
           style={{
             backgroundImage:
               'repeating-linear-gradient(0deg, rgba(255,255,255,0.4), rgba(255,255,255,0.4) 1px, rgba(240,240,240,0.4) 1px, rgba(240,240,240,0.4) 3px), linear-gradient(to bottom, #f6f6f6, #d6d6d6)'
           }}>
        <div className="flex items-center space-x-[6px] select-none">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(0,0,0,0.45)]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #ffb3ad 0%, #ff5f56 60%, #e33d2e 100%)'
            }}
          >
            <span className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                  }} />
            {/* darker top band */}
            <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0))'
                  }} />
          </button>
          {/* Minimize */}
          <div
            aria-hidden
            className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(0,0,0,0.4)]"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #ffe0a1 0%, #ffbd2e 60%, #d79b1e 100%)'
            }}
          >
            <span className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                  }} />
            <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))'
                  }} />
          </div>
          {/* Zoom (Maximize) */}
          <button
            type="button"
            aria-label="Maximize"
            title="Maximize"
            onClick={onToggleMaximize}
            className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(0,0,0,0.4)] cursor-pointer"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #b6f0c1 0%, #27ca3f 60%, #16a42b 100%)'
            }}
          >
            <span className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                  }} />
            <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))'
                  }} />
          </button>
        </div>
        <div className="text-[13px] font-medium text-[#333] flex-1 text-center truncate">
          {tabs.find(t => t.isActive)?.title || 'Internet'}
        </div>
        <div className="w-16" />
      </div>

      {/* Unified nav+bookmarks bar */}
      <div
        className="border-b border-[#a7a7a7] px-2 pt-1 pb-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35) 1px, rgba(238,238,238,0.35) 1px, rgba(238,238,238,0.35) 3px), linear-gradient(to bottom, #efefef, #d3d3d3)'
        }}
      >
        <div className="flex items-center w-full">
          {/* Back/Forward buttons */}
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`w-5 h-7 flex items-center justify-center rounded transition-all border border-transparent bg-transparent
              ${canGoBack ? 'hover:border-[#888] hover:bg-white/60' : 'opacity-60 cursor-not-allowed'}`}
            style={{ minWidth: 32 }}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="21" y1="14" x2="7" y2="14" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="13,8 7,14 13,20" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-5 h-7 mr-2 flex items-center justify-center rounded transition-all border border-transparent bg-transparent
              ${canGoForward ? 'hover:border-[#888] hover:bg-white/60' : 'opacity-60 cursor-not-allowed'}`}
            style={{ minWidth: 32 }}
            aria-label="Forward"
          >
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="7" y1="14" x2="21" y2="14" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="15,8 21,14 15,20" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Address bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center relative  min-w-0">
            <input
              ref={urlInputRef}
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                handleFilterSuggestions(e.target.value);
                setIsUrlDropdownOpen(e.target.value.trim().length > 0);
              }}
              onFocus={() => {
                if (urlInput.trim().length > 0) {
                  setIsUrlDropdownOpen(true);
                }
                urlInputRef.current?.select();
              }}
              onBlur={() => setTimeout(() => setIsUrlDropdownOpen(false), 120)}
              onKeyDown={(e) => {
                if (!isUrlDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                  setIsUrlDropdownOpen(true);
                }
                if (isUrlDropdownOpen && filteredSuggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedSuggestionIndex((i) => (i + 1) % filteredSuggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedSuggestionIndex((i) => (i - 1 + filteredSuggestions.length) % filteredSuggestions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleNavigateFromSuggestion(filteredSuggestions[selectedSuggestionIndex]);
                  } else if (e.key === 'Escape') {
                    setIsUrlDropdownOpen(false);
                  }
                }
              }}
              className="flex-1 px-3 py-[2px] border border-[#bdbdbd] rounded-[4px] bg-white text-[12px] font-sans text-black shadow-none focus:outline-none h-[28px] min-h-0"
              style={{
                boxSizing: 'border-box',
                width: '100%',
                fontFamily: '"SF Pro Text","SF Pro Display",-apple-system,Segoe UI,Roboto,Arial,sans-serif'
              }}
              placeholder="Enter URL"
              spellCheck={false}
              autoComplete="off"
            />
            {/* Suggestions dropdown */}
            {isUrlDropdownOpen && filteredSuggestions.length > 0 && (
              <div
                className="absolute left-0 right-0 mt-1 z-20 rounded-lg border border-[#d1d5db] shadow-lg overflow-hidden backdrop-blur-md bg-white/80"
                style={{ minWidth: '100%', top: '110%' }}
              >
                {filteredSuggestions.map((s, idx) => (
                  <button
                    key={s.title + idx}
                    className={`w-full flex items-center px-4 py-2 text-[14px] ${idx === selectedSuggestionIndex ? 'bg-[#f3f6fa]' : 'bg-transparent'} transition-colors`}
                    onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleNavigateFromSuggestion(s)}
                  >
                    <span className="flex items-center mr-3">
                      <span className="inline-block align-middle w-4 h-4 mr-2">
                        <FaGlobe className="w-4 h-4 text-[#888]" />
                      </span>
                      <span className="text-[#222] font-medium truncate max-w-[180px]">{s.title}</span>
                    </span>
                    <span className="ml-auto text-[#888] text-xs font-mono truncate max-w-[120px]">{s.type === 'search' ? s.url.replace(/^bing:/i, 'Search: ') : s.url}</span>
                  </button>
                ))}
              </div>
            )}
            <button 
              type="submit"
              className="ml-2 px-3 bg-gradient-to-b from-[#fafafa] to-[#e0e0e0] border border-[#999] rounded text-[13px] hover:from-[#f4f4f4] hover:to-[#dcdcdc] active:from-[#d8d8d8] active:to-[#c8c8c8] text-black h-[24px] min-h-0"
              style={{ minWidth: 36 }}
            >
              Go
            </button>
          </form>
  </div>

      {/* Bookmarks bar (now visually merged with nav bar) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-2">
          {[
            { title: 'apple', url: 'https://apple.com', favicon: '/api/proxy?url=https://www.apple.com/favicon.ico' },
            { title: 'bing', url: 'https://bing.com', favicon: '/api/proxy?url=https://www.bing.com/favicon.ico' },
            { title: 'advay', url: 'https://advay.ca', favicon: '/favicon.png' },
            { title: 'github', url: 'https://github.com/advayc', favicon: '/api/proxy?url=https://github.com/favicon.ico' },
          ].map((b) => (
            <button
              key={b.url}
              onClick={() => navigateToUrl(b.url)}
              className="flex items-center gap-2 px-[7px] py-[3px] rounded border border-[#bdbdbd] hover:border-[#a7a7a7] shadow-[inset_0_1px_0_0_#ffffff] hover:from-[#fafafa] hover:to-[#e6e6e6] active:from-[#e8e8e8] active:to-[#d8d8d8] text-[12px] text-[#333] whitespace-nowrap"
              title={b.title}
            >
              {b.favicon ? (
                <img src={b.favicon} alt="" className="w-4 h-4 rounded" />
              ) : (
                <FaGlobe className="w-3.5 h-3.5 text-[#666]" />
              )}
              <span>{b.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
  <div className="flex-1 bg-white overflow-hidden relative">
        {currentUrl === 'about:blank' ? (
          <div className="w-full h-full flex items-center justify-center bg-white">
            <div className="text-center">
              <h2 className="text-xl text-[#333] mb-4">New Tab</h2>
              <p className="text-[#666] mb-8">Enter a URL to browse the web</p>
              
              {/* Quick access bookmarks */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {bookmarks.slice(0, 6).map((bookmark, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToUrl(bookmark.url)}
                    className="flex items-center p-3 bg-[#f8f8f8] hover:bg-[#f0f0f0] rounded border text-left"
                  >
                    {bookmark.favicon && (
                      <img src={bookmark.favicon} alt="" className="w-5 h-5 mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-sm text-[#333]">{bookmark.title}</div>
                      <div className="text-xs text-[#666]">{formatUrlForDisplay(bookmark.url)}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={currentUrl !== 'about:blank' ? toProxy(currentUrl) : ''}
              className="w-full h-full border-0"
              title="Web Content"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation allow-same-origin"
              allow="geolocation; microphone; camera; midi; accelerometer; gyroscope; payment; encrypted-media; usb"
            />
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A90E2] animate-pulse"></div>
            )}
            {lastError && (
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <div className="text-6xl mb-4">😟</div>
                  <h2 className="text-xl font-semibold mb-2">Couldn&apos;t load page</h2>
                  <p className="text-gray-600 mb-4">{lastError}</p>
                  <button 
                    onClick={() => {
                      setLastError(null);
                      refresh();
                    }}
                    className="bg-[#4A90E2] text-white px-4 py-2 rounded hover:bg-[#357ABD] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status bar */}
  <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d4d4d4] border-t border-[#999] px-3 py-1">
        <div className="flex items-center justify-between text-xs text-[#333]">
          <span>
            {lastError ? `Error: ${lastError}` : isLoading ? 'Loading...' : 'Done'}
          </span>
          <span>
            {tabs.length} tab{tabs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}