import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import Terminal from "@/components/Terminal";
import File from "@/components/File";
import Footer from "@/components/Footer";
import SelectionBox from "@/components/SelectionBox";
import { useTerminal } from "@/components/TerminalContext";

const inter = Inter({ subsets: ["latin"] });

type ToggleOptionsType = 'dark' | 'light';

export default function Home() {
  const { isTerminalOpen, setIsTerminalOpen } = useTerminal();
  const [selected, setSelected] = useState<ToggleOptionsType>('light');

  useEffect(() => {
    if (selected === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [selected]);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.9 } }
  };

  return (
    <motion.main 
      className={`${inter.className} flex items-center justify-center min-h-screen`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="h-screen w-full bg-neutral-950 bg-grid-white/[0.025] relative flex items-center justify-center">
        <motion.div variants={fadeIn}>
          <motion.h1 
            className="text-5xl font-bold text-center text-white mb-8"
            variants={fadeIn}
          >
            Hi, I'm Advay!
          </motion.h1>
          <motion.div 
            className="flex flex-col items-center justify-center space-y-2"
            variants={fadeIn}
          >
            <File
              setWindowOpen={() => setIsTerminalOpen(true)}
              className="w-16 h-16"
              filename="learn.exe"
              imageSrc="/computer.png"
            />
          </motion.div>
          {isTerminalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Terminal onClose={() => setIsTerminalOpen(false)} />
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer selected={selected} setSelected={setSelected} />
      <SelectionBox />
    </motion.main>
  );
}