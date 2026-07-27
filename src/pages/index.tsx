import React, { useEffect, useState, useCallback, startTransition } from "react";
import dynamic from "next/dynamic";
import File from "@/components/File";
import Footer from "@/components/Footer";
import SelectionBox from "@/components/SelectionBox";
import ShortcutHint from "@/components/ShortcutHint";
import { useTerminal } from "@/components/TerminalContext";
import Link from '@/components/Link';
import Head from 'next/head';
import { fileManifest } from '@/lib/fileManifest';
import { calculateAge } from '@/utils/age';

const Terminal = dynamic(() => import("@/components/Terminal"), { ssr: false });
const DrawTerminal = dynamic(() => import("@/components/DrawTerminal"), { ssr: false });
const InternetTerminal = dynamic(() => import("@/components/InternetTerminal"), { ssr: false });
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const HitCounter = dynamic(() => import("@/components/HitCounter"), { ssr: false });

const prefetchById: Record<string, () => void> = {
  experience: () => {
    void import('@/lib/fileConfigs');
    void import('@/components/Terminal');
  },
  projects: () => {
    void import('@/lib/fileConfigs');
    void import('@/components/Terminal');
  },
  internet: () => void import('@/components/InternetTerminal'),
  draw: () => void import('@/components/DrawTerminal'),
};

interface TerminalState {
  id: number;
  stackOffset: number;
  manualPosition?: { x: number; y: number };
  headerText: string;
  pathText: string;
  branchText: string;
  infoText: string;
  projects?: Project[];
  workExperience?: WorkExperience[];
  startMaximized?: boolean;
}

interface Project {
  title: string;
  description: string;
  repoUrl: string;
  technologies: string;
  projectLink?: string;
}

interface WorkExperience {
  title: string;
  company?: string;
  duration: string;
  description: string;
  technologies?: string;
  link: string;
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Advay Chandorkar",
  "url": "https://advay.ca/",
  "image": "https://advay.ca/meta.png",
  "sameAs": [
    "https://github.com/advayc",
    "https://linkedin.com/in/advay"
  ],
  "jobTitle": "Full Stack Developer",
  "worksFor": {
    "@type": "Organization",
    "name": "Self-Employed"
  }
};

const BIRTH_DATE = new Date(2008, 11, 16);
const AGE = calculateAge(BIRTH_DATE);

export default function Home() {
  const { setIsTerminalOpen } = useTerminal();
  const [terminals, setTerminals] = useState<TerminalState[]>([]);
  const [drawTerminalOpen, setDrawTerminalOpen] = useState(false);
  const [internetTerminalOpen, setInternetTerminalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('#22D3EE');
  const [fontFamily, setFontFamily] = useState<string>('"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace');
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots' | 'none'>('grid');
  const [bgColor, setBgColor] = useState<string>('#0a0a0a');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const storedAccent = localStorage.getItem('siteAccentColor') ?? localStorage.getItem('resumeAccentColor');
      const storedFont = localStorage.getItem('siteFontFamily');
      const storedBg = localStorage.getItem('siteBgStyle');
      const storedBgColor = localStorage.getItem('siteBgColor');
      const storedTheme = localStorage.getItem('siteTheme');
      if (storedAccent) setAccentColor(storedAccent);
      if (storedFont) setFontFamily(storedFont);
      if (storedBg === 'grid' || storedBg === 'dots' || storedBg === 'none') setBgStyle(storedBg);
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

  useEffect(() => {
    const schedule = () => {
      void import('@/lib/fileConfigs');
      void import('@/components/Terminal');
    };
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(schedule, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(schedule, 1500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    const rgb = accentColor.replace('#', '');
    if (rgb.length === 6) {
      const r = parseInt(rgb.slice(0, 2), 16);
      const g = parseInt(rgb.slice(2, 4), 16);
      const b = parseInt(rgb.slice(4, 6), 16);
      document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    }
    try { localStorage.setItem('siteAccentColor', accentColor); } catch {}
  }, [accentColor]);

  useEffect(() => {
    try { localStorage.setItem('siteFontFamily', fontFamily); } catch {}
  }, [fontFamily]);

  useEffect(() => { try { localStorage.setItem('siteBgStyle', bgStyle); } catch {} }, [bgStyle]);
  useEffect(() => { try { localStorage.setItem('siteBgColor', bgColor); } catch {} }, [bgColor]);

  const openTerminal = useCallback((fileId: string) => {
    const params = new URLSearchParams(window.location.search);
    const manualX = params.get('tx');
    const manualY = params.get('ty');
    const parsedX = manualX !== null ? Number(manualX) : undefined;
    const parsedY = manualY !== null ? Number(manualY) : undefined;

    if (fileId === 'draw') {
      if (!document.querySelector('[data-draw-instance]')) {
        startTransition(() => {
          setDrawTerminalOpen(true);
          setIsTerminalOpen(true);
        });
      }
      return;
    }

    if (fileId === 'internet') {
      if (!document.querySelector('[data-internet-instance]')) {
        startTransition(() => {
          setInternetTerminalOpen(true);
          setIsTerminalOpen(true);
        });
      }
      return;
    }

    void (async () => {
      const { fileConfigs } = await import('@/lib/fileConfigs');
      const fileConfig = fileConfigs.find((config) => config.id === fileId);
      if (!fileConfig?.terminalConfig) return;

      startTransition(() => {
        setTerminals((prev) => {
          const hasManualPosition =
            typeof parsedX === 'number' &&
            !Number.isNaN(parsedX) &&
            typeof parsedY === 'number' &&
            !Number.isNaN(parsedY);

          const newTerminal: TerminalState = {
            id: prev.length,
            stackOffset: prev.length * 32,
            ...(hasManualPosition ? { manualPosition: { x: parsedX, y: parsedY } } : {}),
            headerText: fileConfig.terminalConfig.headerText,
            pathText: fileConfig.terminalConfig.pathText,
            branchText: fileConfig.terminalConfig.branchText,
            infoText: fileConfig.terminalConfig.infoText,
            projects: fileConfig.terminalConfig.projects,
            workExperience: fileConfig.terminalConfig.workExperience,
            startMaximized: fileId === 'projects',
          };
          return [...prev, newTerminal];
        });
        setIsTerminalOpen(true);
      });
    })();
  }, [setIsTerminalOpen]);

  const backgroundStyle =
    bgStyle === 'grid'
      ? {
          backgroundColor: bgColor,
          backgroundImage:
            'linear-gradient(rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          fontFamily,
        }
      : bgStyle === 'dots'
        ? {
            backgroundColor: bgColor,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(var(--accent-color-rgb),0.16) 1px, transparent 0)',
            backgroundSize: '26px 26px',
            fontFamily,
          }
        : { backgroundColor: bgColor, backgroundImage: 'none', fontFamily };

  return (
    <main className="flex items-center justify-center min-h-screen">
      <Head>
        <title>advay chandorkar</title>
        <link rel="shortcut icon" href="/favicon.png" />
        {fontFamily.includes('Inter') && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </>
        )}
        {fontFamily.includes('Space Mono') && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
          </>
        )}
        {fontFamily.includes('SF Mono') && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
          </>
        )}
        {fontFamily.includes('JetBrains Mono') && (
          <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        )}
        {fontFamily.includes('Roboto Mono') && (
          <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div
        className="h-screen w-full relative flex items-center justify-center px-3 sm:px-0"
        style={backgroundStyle}
      >
        <div className="relative w-full max-w-[1100px]">
          <h1 className="text-3xl sm:text-5xl font-bold text-center text-foreground mb-4 sm:mb-6 tracking-tight">
            advay chandorkar
          </h1>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex flex-col leading-relaxed text-primary text-center text-[14px] sm:text-base px-1" style={{ fontFamily }}>
              <p>
                i&apos;m a {AGE} year old full-stack developer from{' '}
                <Link href="https://www.google.com/maps/search/Toronto,%20Ontario,%20Canada">Toronto, ON</Link>{' '}
                and i like building things and solving problems
              </p>
              <p className="mt-1">
                right now, i&apos;m an incoming first year ce student @ <Link href="https://queensu.ca">queens university</Link> and i&apos;m working on <Link href="https://github.com/Seva-Eats">seva eats</Link>
              </p>
              <p className="mt-1">
                to learn more about me, click the files - or view my resume <Link href="/resume.pdf">here</Link> or browse <Link target="_blank" href="/resume">resume</Link>.
              </p>
              <div className="mt-2">
                <HitCounter id="home" variant="hero" fontFamily={fontFamily} />
              </div>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 flex gap-3 sm:gap-4 flex-wrap justify-center max-w-[92vw] px-2">
            {fileManifest.map((file, index) => (
              <File
                key={file.id}
                setWindowOpen={() => openTerminal(file.id)}
                className="px-1 sm:px-2"
                filename={file.filename}
                imageSrc={file.imageSrc}
                id={file.id}
                eager={index < 2}
                onPrefetch={() => prefetchById[file.id]?.()}
              />
            ))}
          </div>
          {internetTerminalOpen && (
            <InternetTerminal
              onClose={() => setInternetTerminalOpen(false)}
              headerText="advaychandorkar@personalsite: ~/internet/browser"
            />
          )}
          {drawTerminalOpen && (
            <DrawTerminal
              onClose={() => setDrawTerminalOpen(false)}
              headerText="advaychandorkar@personalsite: ~/games/draw.exe"
            />
          )}
        </div>
        {terminals.map((terminal) => (
          <Terminal
            key={terminal.id}
            onClose={() => setTerminals((prev) => prev.filter((t) => t.id !== terminal.id))}
            headerText={terminal.headerText}
            pathText={terminal.pathText}
            branchText={terminal.branchText}
            infoText={terminal.infoText}
            projects={terminal.projects}
            workExperience={terminal.workExperience}
            startMaximized={terminal.startMaximized}
            stackOffset={isMobile ? 0 : terminal.stackOffset}
            initialX={isMobile ? undefined : terminal.manualPosition?.x}
            initialY={isMobile ? undefined : terminal.manualPosition?.y}
          />
        ))}
      </div>
      <Footer accentColorProp={accentColor} setAccentColorProp={setAccentColor} theme={theme} setThemeProp={setTheme} />
      <SelectionBox />
      <ShortcutHint onOpen={() => setIsPaletteOpen(true)} />
      {isPaletteOpen && (
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
      )}
    </main>
  );
}
