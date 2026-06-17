const FONT_URLS: Record<string, string> = {
  Inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'Space Mono': 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
  'Source Code Pro': 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap',
  'JetBrains Mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
  'Roboto Mono': 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap',
};

export function loadFontIfNeeded(fontFamily: string) {
  if (typeof document === 'undefined') return;

  for (const [name, url] of Object.entries(FONT_URLS)) {
    if (!fontFamily.includes(name)) continue;
    if (document.querySelector(`link[data-site-font="${name}"]`)) continue;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset.siteFont = name;
    document.head.appendChild(link);
  }
}
