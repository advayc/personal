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
    favicon: 'https://www.google.com/s2/favicons?domain=apple.com&sz=32' 
  }]);
  const [currentUrl, setCurrentUrl] = useState('https://apple.com');
  const [urlInput, setUrlInput] = useState('apple.com');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [navigationIndex, setNavigationIndex] = useState(-1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
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
    if (/^localhost(:\d+)?(\/|$)/i.test(s)) return true;
    if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/|$)?$/.test(s)) return true; // IPv4
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/|$)?$/i.test(s);
  };

  const handleSearch = (query: string) => {
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
      { title: 'advay.ca', url: 'https://advay.ca', favicon: 'https://www.google.com/s2/favicons?domain=advay.ca&sz=32' },
      { title: 'github', url: 'https://github.com/advayc', favicon: 'https://www.google.com/s2/favicons?domain=github.com&sz=32' },
      { title: 'linkedin', url: 'https://www.linkedin.com/in/advay/', favicon: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=32' },
    ];
    setBookmarks(defaultBookmarks);
    localStorage.setItem('ie-bookmarks', JSON.stringify(defaultBookmarks));
  };

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('ie-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ie-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ie-tabs', JSON.stringify(tabs));
  }, [tabs]);

  // Format URL for display (remove protocol)
  const formatUrlForDisplay = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
            case 'error':
              console.error('Iframe reported error:', event.data.message);
              setLastError(event.data.message);
              break;
            case 'title':
              if (event.data.title) {
                setTabs(prevTabs => 
                  prevTabs.map(tab => 
                    tab.isActive 
                      ? { ...tab, title: event.data.title }
                      : tab
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
      if (!isValidUrl(url)) {
        fullUrl = `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
      } else {
        fullUrl = `https://${url}`;
      }
    }

  // If navigating to Google, ensure igu=1 param is present to reduce frame busting
    try {
      const u = new URL(fullUrl);
      const host = u.hostname;
      const isGoogle = /(^|\.)google\.(com|ca|co\.[a-z]{2}|[a-z]{2})$/i.test(host);
      if (isGoogle) {
        if (u.pathname === '/' || u.pathname === '') {
          u.pathname = '/webhp';
        }
        if (!u.searchParams.has('igu')) {
      u.searchParams.set('igu', '1');
        }
        fullUrl = u.toString();
      }
    } catch {
      /* ignore parse issues */
    }

    setIsLoading(true);
    setCurrentUrl(fullUrl);
    setUrlInput(formatUrlForDisplay(fullUrl));

    // Update navigation history
    const newHistory = [...navigationHistory.slice(0, navigationIndex + 1), fullUrl];
    setNavigationHistory(newHistory);
    setNavigationIndex(newHistory.length - 1);
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);

    // Update active tab
    setTabs(prevTabs => 
      prevTabs.map(tab => 
        tab.isActive 
          ? { ...tab, url: fullUrl, title: 'Loading...' }
          : tab
      )
    );

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
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(fullUrl).hostname}&sz=32`
    };
    setHistory(prevHistory => [historyEntry, ...prevHistory.slice(0, 99)]);
  }, [navigationHistory, navigationIndex]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setRetryCount(0); // Reset retry count on successful load
    setLastError(null); // Clear any previous errors

    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const title = iframe.contentDocument.title || formatUrlForDisplay(currentUrl);
        const hostname = new URL(currentUrl).hostname;
        const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
        
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
      }
    } catch (error) {
      console.error('Failed to access iframe content:', error);
      setIsLoading(false);
    }
  };  const handleIframeError = () => {
    setIsLoading(false);
    setLastError(`Failed to load: ${currentUrl}`);
    console.error('Failed to load page:', currentUrl);
    
    // Auto-retry up to 2 times with a delay
    if (retryCount < 2) {
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
      setUrlInput(formatUrlForDisplay(newTabs[newActiveIndex].url));
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
      setUrlInput(formatUrlForDisplay(activeTab.url));
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
    if (filteredSuggestions.length > 0 && isUrlDropdownOpen) {
      handleNavigateFromSuggestion(filteredSuggestions[selectedSuggestionIndex]);
    } else if (isValidUrl(urlInput)) {
      navigateToUrl(urlInput);
    } else {
      handleSearch(urlInput);
    }
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
    <div className="w-full h-full bg-[#e9e9e9] flex flex-col overflow-hidden font-sans">
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

      {/* Navigation bar (thinner, Aqua toolbar with pinstripes) */}
      <div
        className="border-b border-[#a7a7a7] px-2 py-1"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35) 1px, rgba(238,238,238,0.35) 1px, rgba(238,238,238,0.35) 3px), linear-gradient(to bottom, #efefef, #d3d3d3)'
        }}
      >
        <div className="flex items-center gap-2">
          {/* Back/Forward buttons */}
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`w-7 h-7 rounded border ${
              canGoBack 
                ? 'bg-gradient-to-b from-[#fafafa] to-[#e0e0e0] border-[#999] hover:from-[#f4f4f4] hover:to-[#dcdcdc] active:from-[#d8d8d8] active:to-[#c8c8c8] text-[#333]' 
                : 'bg-[#e8e8e8] border-[#ccc] cursor-not-allowed text-[#999]'
            } flex items-center justify-center text-base font-bold leading-none`}
          >
            ‹
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className={`w-7 h-7 rounded border ${
              canGoForward 
                ? 'bg-gradient-to-b from-[#fafafa] to-[#e0e0e0] border-[#999] hover:from-[#f4f4f4] hover:to-[#dcdcdc] active:from-[#d8d8d8] active:to-[#c8c8c8] text-[#333]' 
                : 'bg-[#e8e8e8] border-[#ccc] cursor-not-allowed text-[#999]'
            } flex items-center justify-center text-base font-bold leading-none`}
          >
            ›
          </button>

          {/* Address bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center">
            <input
              ref={urlInputRef}
              type="text"
              value={urlInput}
              onChange={(e) => {
                const strippedValue = stripProtocol(e.target.value);
                setUrlInput(strippedValue);
                handleFilterSuggestions(strippedValue);
                setIsUrlDropdownOpen(true);
              }}
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
              className="flex-1 px-3 py-[5px] border border-[#9c9c9c] rounded-[16px] bg-white text-[13px] font-mono text-black shadow-[inset_0_1px_0_0_#ffffff,inset_0_0_6px_rgba(0,0,0,0.05)]"
              placeholder="Enter URL"
              spellCheck={false}
            />
            <button 
              type="submit"
              className="ml-2 px-3 py-[5px] bg-gradient-to-b from-[#fafafa] to-[#e0e0e0] border border-[#999] rounded text-[13px] hover:from-[#f4f4f4] hover:to-[#dcdcdc] active:from-[#d8d8d8] active:to-[#c8c8c8] text-black"
            >
              Go
            </button>
          </form>
          {/* Suggestions dropdown */}
          {isUrlDropdownOpen && filteredSuggestions.length > 0 && (
            <div className="absolute left-2 right-2 mt-9 z-10 bg-white border border-[#bdbdbd] rounded shadow">
              {filteredSuggestions.map((s, idx) => (
                <button
                  key={s.title + idx}
                  className={`w-full text-left px-3 py-2 text-[12px] ${idx === selectedSuggestionIndex ? 'bg-[#e6f0ff]' : ''}`}
                  onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                  onMouseDown={(e) => { e.preventDefault(); }}
                  onClick={() => handleNavigateFromSuggestion(s)}
                >
                  <span className="text-[#333]">{s.title}</span>
                  <span className="ml-2 text-[#777]">{s.type === 'search' ? s.url.replace(/^bing:/i, 'Search: ') : s.url}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bookmarks bar */}
      <div
        className="border-b border-[#a7a7a7] px-2 py-[4px]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.35), rgba(255,255,255,0.35) 1px, rgba(238,238,238,0.35) 1px, rgba(238,238,238,0.35) 3px), linear-gradient(to bottom, #efefef, #d3d3d3)'
        }}
      >
        <div className="flex items-center gap-2 overflow-x-auto">
          {[{title: 'advay.ca', url: 'https://advay.ca'}, {title: 'github.com/advayc', url: 'https://github.com/advayc'}, {title: 'LinkedIn', url: 'https://www.linkedin.com/in/advay/'}].map((b) => (
            <button
              key={b.url}
              onClick={() => navigateToUrl(b.url)}
              className="flex items-center gap-2 px-2 py-[3px] rounded border border-[#bdbdbd] bg-gradient-to-b from-white to-[#ececec] shadow-[inset_0_1px_0_0_#ffffff] hover:from-[#fafafa] hover:to-[#e6e6e6] active:from-[#e8e8e8] active:to-[#d8d8d8] text-[12px] text-[#333] whitespace-nowrap"
              title={b.title}
            >
              <span className="text-[#666]">
                {b.url.includes('github.com') ? (
                  <FaGithub className="w-3.5 h-3.5" />
                ) : b.url.includes('linkedin.com') ? (
                  <FaLinkedin className="w-3.5 h-3.5" />
                ) : (
                  <FaGlobe className="w-3.5 h-3.5" />
                )}
              </span>
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
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-pointer-lock"
              allow="geolocation; microphone; camera; midi; xr-spatial-tracking; accelerometer; gyroscope; payment; encrypted-media; usb"
            />
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#4A90E2] animate-pulse"></div>
            )}
          </>
        )}
      </div>

      {/* Status bar */}
  <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d4d4d4] border-t border-[#999] px-3 py-1">
        <div className="flex items-center justify-between text-xs text-[#333]">
          <span>
            {isLoading ? 'Loading...' : 'Done'}
          </span>
          <span>
            {tabs.length} tab{tabs.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
