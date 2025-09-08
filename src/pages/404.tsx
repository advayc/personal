import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SelectionBox from "@/components/SelectionBox";
import Link from '@/components/Link';
import Head from 'next/head';

type ToggleOptionsType = 'dark' | 'light';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9 } }
};

export default function NotFound() {
  const [selected, setSelected] = useState<ToggleOptionsType>('light');
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots' | 'none'>('grid');
  const [bgColor, setBgColor] = useState<string>('#0a0a0a');

  // load settings from localStorage
  useEffect(() => {
    try {
      const storedBg = localStorage.getItem('siteBgStyle');
      const storedBgColor = localStorage.getItem('siteBgColor');
      if (storedBg === 'grid' || storedBg === 'dots' || storedBg === 'none') setBgStyle(storedBg);
      if (storedBgColor) setBgColor(storedBgColor);
    } catch {}
  }, []);

  useEffect(() => {
    if (selected === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
    const favicon = document.querySelector('link[rel="shortcut icon"]');
    if (favicon) {
      favicon.setAttribute('href', '/favicon.png');
    }
  }, [selected]);

  useEffect(() => { try { localStorage.setItem('siteBgStyle', bgStyle); } catch {} }, [bgStyle]);
  useEffect(() => { try { localStorage.setItem('siteBgColor', bgColor); } catch {} }, [bgColor]);

  return (
    <motion.main 
      className={`flex items-center justify-center min-h-screen`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Head>
        <title>404 - Page Not Found</title>
        <link rel="shortcut icon" href={selected === 'light' ? '/favicon.png' : '/favicon2.png'} />
      </Head>
  
      <div className="h-screen w-full relative flex items-center justify-center px-3 sm:px-0"
        style={bgStyle === 'grid' ? { backgroundColor: bgColor, backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`, backgroundSize: '40px 40px' }
          : bgStyle === 'dots' ? { backgroundColor: bgColor, backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.16) 1px, transparent 0)`, backgroundSize: '26px 26px' }
          : { backgroundColor: bgColor, backgroundImage: 'none' }}>
        <div className="text-center text-white relative z-10">
          <h1 className="text-4xl font-bold mb-4">error 404 - you aren&apos;t supposed to be here</h1>
          <p className="text-lg mb-6">
            looks like you&apos;ve wandered off the path.
            head back to the <Link href="/">landing page</Link> to find your way back
          </p>
        </div>
      </div>
      <SelectionBox />
    <Footer selected={selected} setSelected={setSelected} accentColorProp={accentColor} setAccentColorProp={setAccentColor} />
    <ShortcutHint onOpen={() => setIsPaletteOpen(true)} />
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)}
        setAccentColor={setAccentColor}
        setFontFamily={setFontFamily}
        setBgStyle={setBgStyle}
        setBgColor={setBgColor}
        setFreeMoveMode={handleFreeMoveToggle}
        accentColor={accentColor}
        fontFamily={fontFamily}
        bgStyle={bgStyle}
        bgColor={bgColor}
        freeMoveMode={freeMoveMode}
      />
    </motion.main>
  );
}
