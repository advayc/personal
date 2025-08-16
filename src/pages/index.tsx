import React, { useEffect, useState } from "react";
// import { Inter } from "next/font/google";
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
import CommandPalette from "@/components/CommandPalette";
import ShortcutHint from "@/components/ShortcutHint";

// const inter = Inter({ subsets: ["latin"] });
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
  "url": "http://advayc.vercel.app/",
  "image": "http://advayc.vercel.app/meta.png",
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
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('#22D3EE');
  const [fontFamily, setFontFamily] = useState<string>('ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace');
  const [bgStyle, setBgStyle] = useState<'grid' | 'dots'>('grid');

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

  // apply accent color + font globally
  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    const rgb = accentColor.replace('#','');
    if (rgb.length === 6) {
      const r = parseInt(rgb.slice(0,2),16), g=parseInt(rgb.slice(2,4),16), b=parseInt(rgb.slice(4,6),16);
      document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
    }
  }, [accentColor]);

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
    if (fileId === 'pong') {
      const existingPong = document.querySelector('[data-pong-instance]');
      if (!existingPong) {
        setPongTerminalOpen(true);
        setIsTerminalOpen(true);
      }
      return;
    }

    const fileConfig = fileConfigs.find(config => config.id === fileId);
    if (fileConfig && fileConfig.terminalConfig) {
      const newTerminal: TerminalState = {
        id: terminals.length,
        position: { 
          x: -185,
          y: -130 + (terminals.length * 80) 
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      
      <div className="h-screen w-full bg-neutral-950 relative flex items-center justify-center px-4 sm:px-0"
        style={bgStyle === 'grid' ? { backgroundImage: `linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)`, backgroundSize: '40px 40px', fontFamily } : { backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34,211,238,0.14) 1px, transparent 0)`, backgroundSize: '26px 26px', fontFamily }}>
        <motion.div variants={fadeIn} className="relative">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-center text-white mb-6 tracking-tight"
            variants={fadeIn}
          >
            Hi, I'm Advay!
          </motion.h1>
          <motion.div 
            className="flex flex-col items-center justify-center space-y-2"
            variants={fadeIn}
          >
            <div className="flex flex-col leading-relaxed text-primary text-center text-[15px] sm:text-base" style={{fontFamily}}>
              <p>
                I'm a {AGE}-year-old developer from <Link href={"https://www.google.com/maps/place/Mississauga,+ON,+Canada/@43.5774568,-79.6591567,11z/data=!3m1!4b1!4m6!3m5!1s0x882b469fe76b05b7:0x3146cbed75966db!8m2!3d43.5852972!4d-79.6449838!16zL20vMDE1NGd4?entry=ttu&g_ep=EgoyMDI0MDgyMC4xIKXMDSoASAFQAw%3D%3D"}>
                  Mississauga, ON</Link> with a passion for engineering and problem solving.
              </p>
              <p className="mt-1">
                Currently, I'm a grade 11 IB student and
                at the moment, I'm working on <Link href="https://futuremd.tech/">FutureMD</Link>.
              </p>
              <p className="mt-1">
                To learn more about me, click the files! - or view my resume <Link href="/resume.pdf">here</Link>.
              </p>
            </div>
          </motion.div>
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 flex gap-4 flex-wrap justify-center max-w-[90vw]">
            {fileConfigs.map((fileConfig) => (
              <File
                key={fileConfig.id}
                setWindowOpen={() => openTerminal(fileConfig.id)}
                className="px-2"
                filename={fileConfig.filename}
                imageSrc={fileConfig.imageSrc}
              />
            ))}
          </div>
          {terminals.map((terminal) => (
            <motion.div
              key={terminal.id}
              initial={{ opacity: 0, x: terminal.position.x, y: terminal.position.y }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', left: terminal.position.x, top: terminal.position.y }}
            >
              <Terminal 
                onClose={() => setTerminals(terminals.filter(t => t.id !== terminal.id))}
                headerText={terminal.headerText}
                pathText={terminal.pathText}
                branchText={terminal.branchText}
                infoText={terminal.infoText}
                projects={terminal.projects}
                workExperience={terminal.workExperience}
              />
            </motion.div>
          ))}
          {pongTerminalOpen && (
            <PongTerminal
              onClose={handleClosePong}
              headerText="advaychandorkar@personalsite: ~/games/pong"
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
