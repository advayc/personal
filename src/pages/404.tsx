import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Link from '@/components/Link';
import SelectionBox from "@/components/SelectionBox";

type ToggleOptionsType = 'dark' | 'light';

export default function Home() {
  const [selected, setSelected] = useState<ToggleOptionsType>('light');
  const [accentColor, setAccentColor] = useState<string>('#22D3EE');
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots' | 'none'>('grid');
  const [bgColor, setBgColor] = useState<string>('#0a0a0a');
  const [fontFamily, setFontFamily] = useState<string>('"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace');

  // Load settings from localStorage
  useEffect(() => {
    try {
      const storedAccent = localStorage.getItem('siteAccentColor');
      const storedFont = localStorage.getItem('siteFontFamily');
      const storedBg = localStorage.getItem('siteBgStyle');
      const storedBgColor = localStorage.getItem('siteBgColor');
      if (storedAccent) setAccentColor(storedAccent);
      if (storedFont) setFontFamily(storedFont);
      if (storedBg === 'grid' || storedBg === 'dots' || storedBg === 'none') setBgStyle(storedBg);
      if (storedBgColor) setBgColor(storedBgColor);
    } catch {}
  }, []);

  // Apply accent color
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    const rgb = accentColor.replace('#', '');
    if (rgb.length === 6) {
      const r = parseInt(rgb.slice(0, 2), 16), g = parseInt(rgb.slice(2, 4), 16), b = parseInt(rgb.slice(4, 6), 16);
      document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    }
    try { localStorage.setItem('siteAccentColor', accentColor); } catch {}
  }, [accentColor]);

  // Save settings to localStorage
  useEffect(() => { try { localStorage.setItem('siteFontFamily', fontFamily); } catch {} }, [fontFamily]);
  useEffect(() => { try { localStorage.setItem('siteBgStyle', bgStyle); } catch {} }, [bgStyle]);
  useEffect(() => { try { localStorage.setItem('siteBgColor', bgColor); } catch {} }, [bgColor]);

  // Apply light/dark mode
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.9 } }
  };

  return (
    <motion.main 
      className="flex items-center justify-center min-h-screen relative"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      style={
        bgStyle === 'grid' 
          ? { 
              backgroundColor: bgColor, 
              backgroundImage: `linear-gradient(rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px)`, 
              backgroundSize: '40px 40px', 
              fontFamily 
            }
          : bgStyle === 'dots' 
            ? { 
                backgroundColor: bgColor, 
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--accent-color-rgb),0.16) 1px, transparent 0)`, 
                backgroundSize: '26px 26px', 
                fontFamily 
              }
            : { 
                backgroundColor: bgColor, 
                backgroundImage: 'none', 
                fontFamily 
              }
      }
    >
      <div className="text-center text-white relative z-10">
        <h1 className="text-4xl font-bold mb-4">404 - You aren&apos;t supposed to be here!</h1>
        <p className="text-lg mb-6">
          Looks like you&apos;ve wandered off the path. 
          Head back to the <Link href="/index.tsx">main page</Link> to find your way.
        </p>
      </div>
      <Footer 
        selected={selected} 
        setSelected={setSelected} 
        accentColorProp={accentColor} 
        setAccentColorProp={setAccentColor}
        setBgStyle={setBgStyle}
        setBgColor={setBgColor}
        bgStyle={bgStyle}
        bgColor={bgColor}
      />
      <SelectionBox />
    </motion.main>
  );
}
