import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from 'next/head';

const Footer = dynamic(() => import("@/components/Footer"), { ssr: false });
const SelectionBox = dynamic(() => import("@/components/SelectionBox"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const ShortcutHint = dynamic(() => import("@/components/ShortcutHint"), { ssr: false });

type BgStyle = 'grid' | 'dots' | 'none' | 'stripes' | 'crosshatch' | 'polka' | 'diamond';

const bgStyleConfig: Record<BgStyle, { image: string; size?: string }> = {
  grid: {
    image: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
    size: '40px 40px'
  },
  dots: {
    image: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)',
    size: '26px 26px'
  },
  none: { image: 'none' },
  stripes: {
    image: 'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.07) 12px, rgba(255,255,255,0.07) 13px)'
  },
  crosshatch: {
    image: 'repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(255,255,255,0.05) 12px, rgba(255,255,255,0.05) 13px), repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.05) 12px, rgba(255,255,255,0.05) 13px)'
  },
  polka: {
    image: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 2px, transparent 2px)',
    size: '30px 30px'
  },
  diamond: {
    image: 'repeating-linear-gradient(45deg, transparent, transparent 16px, rgba(255,255,255,0.04) 16px, rgba(255,255,255,0.04) 17px), repeating-linear-gradient(-45deg, transparent, transparent 16px, rgba(255,255,255,0.04) 16px, rgba(255,255,255,0.04) 17px)'
  },
};

export default function NotFound() {
  const [bgStyle, setBgStyle] = useState<BgStyle>('grid');
  const [bgColor, setBgColor] = useState<string>('#0a0a0a');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('#6366f1');
  const [fontFamily, setFontFamily] = useState<string>('Inter, sans-serif');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const storedBg = localStorage.getItem('siteBgStyle');
      const storedBgColor = localStorage.getItem('siteBgColor');
      const storedTheme = localStorage.getItem('siteTheme');
      if (storedBg && storedBg in bgStyleConfig) setBgStyle(storedBg as BgStyle);
      if (storedBgColor) setBgColor(storedBgColor);
      if (storedTheme === 'light' || storedTheme === 'dark') setTheme(storedTheme);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try { localStorage.setItem('siteTheme', theme); } catch {}
  }, [theme]);

  useEffect(() => { try { localStorage.setItem('siteBgStyle', bgStyle); } catch {} }, [bgStyle]);
  useEffect(() => { try { localStorage.setItem('siteBgColor', bgColor); } catch {} }, [bgColor]);

  const cfg = bgStyleConfig[bgStyle] ?? bgStyleConfig.none;
  const backgroundStyle = { backgroundColor: bgColor, backgroundImage: cfg.image, backgroundSize: cfg.size };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Head>
        <title>404 - Page Not Found</title>
        <link rel="shortcut icon" href="/favicon.png" />
      </Head>

      <div
        className="h-screen w-full relative flex items-center justify-center px-3 sm:px-0"
        style={backgroundStyle}
      >
        <div className="text-center relative z-10" style={{ color: 'rgb(var(--text-rgb))' }}>
          <h1 className="text-4xl font-bold mb-4">error 404 - you aren&apos;t supposed to be here</h1>
          <p className="text-lg mb-6">
            looks like you&apos;ve wandered off the path.
            head back to the <a href="/" className="hover:underline" style={{ color: 'var(--accent-color)' }}>landing page</a>
          </p>
        </div>
      </div>
      <SelectionBox />
      <Footer accentColorProp={accentColor} setAccentColorProp={setAccentColor} theme={theme} setThemeProp={setTheme} />
      <ShortcutHint onOpen={() => setIsPaletteOpen(true)} />
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        setAccentColor={setAccentColor}
        setFontFamily={setFontFamily}
        setBgStyle={setBgStyle}
        setBgColor={setBgColor}
        setTheme={setTheme}
        accentColor={accentColor}
        fontFamily={fontFamily}
        bgStyle={bgStyle}
        bgColor={bgColor}
        theme={theme}
      />
    </main>
  );
}
