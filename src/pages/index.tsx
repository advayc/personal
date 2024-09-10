import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import Terminal from "@/components/Terminal";
import File from "@/components/File";
import Footer from "@/components/Footer";
import SelectionBox from "@/components/SelectionBox";
import { useTerminal } from "@/components/TerminalContext";
import Link from '@/components/Link';
import Head from 'next/head'; 
import {fileConfigs} from '@/lib/fileConfigs';

const inter = Inter({ subsets: ["latin"] });
type ToggleOptionsType = 'dark' | 'light';

interface TerminalState {
  id: number;
  position: { x: number; y: number };
  headerText: string;
  pathText: string;
  branchText: string;
  infoText: string;
  projects?: {
    title: string;
    description: string;
    repoUrl: string;
    technologies: string;
  }[];
  workExperience?: {
    title: string;
    company: string;
    duration: string;
    description: string;
    technologies?: string;
    link: string;
  }[];
}

export default function Home() {
  const { isTerminalOpen, setIsTerminalOpen } = useTerminal();
  const [selected, setSelected] = useState<ToggleOptionsType>('light');
  const [terminals, setTerminals] = useState<TerminalState[]>([]);

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
    if (terminals.length < fileConfigs.length) {
      const fileConfig = fileConfigs.find(config => config.id === fileId);
      if (fileConfig) {
        const newTerminal: TerminalState = {
          id: terminals.length,
          position: { 
            x: -185,
            y: -130 + (terminals.length * 80) 
          },
          ...fileConfig.terminalConfig
        };
        setTerminals([...terminals, newTerminal]);
      }
    }
  };

  return (
    <motion.main 
      className={`${inter.className} flex items-center justify-center min-h-screen`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Head>
        <title>advay chandorkar</title>
        <link rel="shortcut icon" href={selected === 'light' ? '/favicon.png' : '/favicon2.png'} />
      </Head>
      
      <div className="h-screen w-full bg-neutral-950 bg-grid-white/[0.021] relative flex items-center justify-center">
        <motion.div variants={fadeIn} className="relative">
          <motion.h1 
            className="text-5xl font-bold text-center text-white mb-6"
            variants={fadeIn}
          >
            Hi, I'm Advay!
          </motion.h1>
          <motion.div 
            className="flex flex-col items-center justify-center space-y-2"
            variants={fadeIn}
          >
            <div className="flex flex-col leading-relaxed text-primary text-center">
              <p>
                I'm a 15-year-old developer from <Link href={"https://www.google.com/maps/place/Mississauga,+ON,+Canada/@43.5774568,-79.6591567,11z/data=!3m1!4b1!4m6!3m5!1s0x882b469fe76b05b7:0x3146cbed75966db!8m2!3d43.5852972!4d-79.6449838!16zL20vMDE1NGd4?entry=ttu&g_ep=EgoyMDI0MDgyMC4xIKXMDSoASAFQAw%3D%3D"}>
                  Mississauga, ON</Link> with a passion for engineering and problem solving.
              </p>
              <p className="mt-1">
                Currently, I'm a grade 11 IB student at <Link href="https://glenforest.peelschools.org/about-us">Glenforest SS</Link> and
                at the moment, I'm working at <Link href="https://futuremd.tech/">FutureMD</Link>.
              </p>
              <p className="mt-1">
                To learn more about me, click the files!
              </p>
            </div>
          </motion.div>
          <div className="absolute left-1/2 transform -translate-x-1/2 mt-4 flex gap-4">
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
        </motion.div>
      </div>
      <Footer selected={selected} setSelected={setSelected} />
      <SelectionBox />
    </motion.main>
  );
}