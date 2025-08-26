import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Terminal from "@/components/Terminal";
import File from "@/components/File";
import Footer from "@/components/Footer";
import SelectionBox from "@/components/SelectionBox";
import { useTerminal } from "@/components/TerminalContext";
import Link from '@/components/Link';
import Head from 'next/head'; 
import {fileConfigs} from '@/lib/fileConfigs';
import { calculateAge } from '@/utils/age';
import PongTerminal from "@/components/PongTerminal";
import SnakeTerminal from "@/components/SnakeTerminal";
import DrawTerminal from "@/components/DrawTerminal";
import CommandPalette from "@/components/CommandPalette";
import ShortcutHint from "@/components/ShortcutHint";
import HitCounter from '@/components/HitCounter';

type ToggleOptionsType = 'dark' | 'light';

interface TerminalState {
  id: number;
  position: { x: number; y: number };
  headerText: string;
  pathText: string;
  branchText: string;
  infoText: string;
  projects?: Project[];
  workExperience?: WorkExperience[];
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
  const { isTerminalOpen, setIsTerminalOpen } = useTerminal();
  const [selected, setSelected] = useState<ToggleOptionsType>('light');
  const [terminals, setTerminals] = useState<TerminalState[]>([]);
  const [pongTerminalOpen, setPongTerminalOpen] = useState(false);
  const [snakeTerminalOpen, setSnakeTerminalOpen] = useState(false);
  const [drawTerminalOpen, setDrawTerminalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // persisted settings
  const [accentColor, setAccentColor] = useState<string>('#22D3EE');
  const [fontFamily, setFontFamily] = useState<string>('"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace');
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots' | 'none'>('grid');

  // load settings from localStorage
  useEffect(() => {
    try {
      const storedAccent = localStorage.getItem('siteAccentColor');
      const storedFont = localStorage.getItem('siteFontFamily');
      const storedBg = localStorage.getItem('siteBgStyle');
      if (storedAccent) setAccentColor(storedAccent);
      if (storedFont) setFontFamily(storedFont);
  if (storedBg === 'grid' || storedBg === 'dots' || storedBg === 'none') setBgStyle(storedBg);
    } catch {}
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // track mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // apply accent color + font globally
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    const rgb = accentColor.replace('#','');
    if (rgb.length === 6) {
      const r = parseInt(rgb.slice(0,2),16), g=parseInt(rgb.slice(2,4),16), b=parseInt(rgb.slice(4,6),16);
      document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    }
    try { localStorage.setItem('siteAccentColor', accentColor); } catch {}
  }, [accentColor]);

  useEffect(() => { try { localStorage.setItem('siteFontFamily', fontFamily); } catch {} }, [fontFamily]);
  useEffect(() => { try { localStorage.setItem('siteBgStyle', bgStyle); } catch {} }, [bgStyle]);

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

  const openTerminal = (fileId: string) => {
  // Optional manual override via URL, e.g., ?tx=120&ty=200
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const overrideX = params.get('tx');
  const overrideY = params.get('ty');
  const manualX = overrideX !== null ? Number(overrideX) : undefined;
  const manualY = overrideY !== null ? Number(overrideY) : undefined;
    if (fileId === 'pong') {
      const existingPong = document.querySelector('[data-pong-instance]');
      if (!existingPong) {
        setPongTerminalOpen(true);
        setIsTerminalOpen(true);
      }
      return;
    }
    if (fileId === 'snake') {
      const existingSnake = document.querySelector('[data-snake-instance]');
      if (!existingSnake) {
        setSnakeTerminalOpen(true);
        setIsTerminalOpen(true);
      }
      return;
    }
    if (fileId === 'draw') {
      const existingDraw = document.querySelector('[data-draw-instance]');
      if (!existingDraw) {
        setDrawTerminalOpen(true);
        setIsTerminalOpen(true);
      }
      return;
    }

    const fileConfig = fileConfigs.find(config => config.id === fileId);
    if (fileConfig && fileConfig.terminalConfig) {
    const newTerminal: TerminalState = {
        id: terminals.length,
        position: { 
      x: typeof manualX === 'number' && !Number.isNaN(manualX) ? manualX : -185,
      y: typeof manualY === 'number' && !Number.isNaN(manualY) ? manualY : -130 + (terminals.length * 80) 
        },
        headerText: fileConfig.terminalConfig.headerText,
        pathText: fileConfig.terminalConfig.pathText,
        branchText: fileConfig.terminalConfig.branchText,
        infoText: fileConfig.terminalConfig.infoText,
        projects: fileConfig.terminalConfig.projects,
        workExperience: fileConfig.terminalConfig.workExperience
      };
      setTerminals([...terminals, newTerminal]);
      setIsTerminalOpen(true);
    }
  };

  const handleClosePong = () => {
    setPongTerminalOpen(false);
  };
  const handleCloseSnake = () => { setSnakeTerminalOpen(false); };
  const handleCloseDraw = () => { setDrawTerminalOpen(false); };

  return (
    <motion.main 
  className={`flex items-center justify-center min-h-screen`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Head>
        <title>advay chandorkar</title>
        <link rel="shortcut icon" href={selected === 'light' ? '/favicon.png' : '/favicon2.png'} />
        {/* Preload & load selected fonts if they involve external families */}
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
      
  <div className="h-screen w-full bg-neutral-950 relative flex items-center justify-center px-3 sm:px-0"
        style={bgStyle === 'grid' ? { backgroundImage: `linear-gradient(rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--accent-color-rgb),0.06) 1px, transparent 1px)`, backgroundSize: '40px 40px', fontFamily }
          : bgStyle === 'dots' ? { backgroundImage: `radial-gradient(circle at 1px 1px, rgba(var(--accent-color-rgb),0.16) 1px, transparent 0)`, backgroundSize: '26px 26px', fontFamily }
          : { backgroundImage: 'none', fontFamily }}>
        <motion.div variants={fadeIn} className="relative w-full max-w-[1100px]">
          <motion.h1 
            className="text-3xl sm:text-5xl font-bold text-center text-white mb-4 sm:mb-6 tracking-tight"
            variants={fadeIn}
          >
            Hi, I'm Advay
          </motion.h1>
          <motion.div 
            className="flex flex-col items-center justify-center space-y-2"
            variants={fadeIn}
          >
            <div className="flex flex-col leading-relaxed text-primary text-center text-[14px] sm:text-base px-1" style={{fontFamily}}>
              <p>
                i'm a {AGE} year old full-stack developer from <Link href={"https://www.google.com/maps/place/Mississauga,+ON,+Canada/@43.5774568,-79.6591567,11z/data=!3m1!4b1!4m6!3m5!1s0x882b469fe76b05b7:0x3146cbed75966db!8m2!3d43.5852972!4d-79.6449838!16zL20vMDE1NGd4?entry=ttu&g_ep=EgoyMDI0MDgyMC4xIKXMDSoASAFQAw%3D%3D"}>
                  Mississauga, ON</Link> and i like building things and solving problems
              </p>
              <p className="mt-1">
                right now, i'm a grade 12 ib student and
                i'm working on <Link href="https://sitemaker.advay.ca/">sitemaker</Link>. and <Link href="https://docs.advay.ca/">nums</Link>
              </p>
              <p className="mt-1">
                to learn more about me, click the files - or view my resume <Link href="/resume.pdf">here</Link>.
              </p>
              <div className="mt-2">
                <HitCounter id="home" variant="hero" fontFamily={fontFamily} />
              </div>
            </div>
          </motion.div>
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 flex gap-3 sm:gap-4 flex-wrap justify-center max-w-[92vw] px-2">
            {fileConfigs.map((fileConfig) => (
              <File
                key={fileConfig.id}
                setWindowOpen={() => openTerminal(fileConfig.id)}
                className="px-1 sm:px-2"
                filename={fileConfig.filename}
                imageSrc={fileConfig.imageSrc}
              />
            ))}
          </div>
          {terminals.map((terminal) => (
            <motion.div
              key={terminal.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Terminal 
                onClose={() => setTerminals(terminals.filter(t => t.id !== terminal.id))}
                headerText={terminal.headerText}
                pathText={terminal.pathText}
                branchText={terminal.branchText}
                infoText={terminal.infoText}
                projects={terminal.projects}
                workExperience={terminal.workExperience}
                initialX={isMobile ? undefined : terminal.position.x}
                initialY={isMobile ? undefined : terminal.position.y}
              />
            </motion.div>
          ))}
          {pongTerminalOpen && (
            <PongTerminal
            onClose={handleClosePong}
            headerText="advaychandorkar@personalsite: ~/games/pong"
            />
          )}
          {snakeTerminalOpen && (
            <SnakeTerminal
            onClose={handleCloseSnake}
            headerText="advaychandorkar@personalsite: ~/games/snake"
            />
          )}
          {drawTerminalOpen && (
            <DrawTerminal
              onClose={handleCloseDraw}
              headerText="advaychandorkar@personalsite: ~/games/draw.exe"
            />
          )}
        </motion.div>
      </div>
      <Footer selected={selected} setSelected={setSelected} accentColorProp={accentColor} setAccentColorProp={setAccentColor} />
      <SelectionBox />
      <ShortcutHint onOpen={() => setIsPaletteOpen(true)} />
      <CommandPalette 
        isOpen={isPaletteOpen} 
        onClose={() => setIsPaletteOpen(false)}
        setAccentColor={setAccentColor}
        setFontFamily={setFontFamily}
        setBgStyle={setBgStyle}
        accentColor={accentColor}
        fontFamily={fontFamily}
        bgStyle={bgStyle}
      />
      
    </motion.main>
  );
}
