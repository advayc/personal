import React, { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { motion } from "framer-motion";
import Terminal from "@/components/Terminal";
import File from "@/components/File";
import Footer from "@/components/Footer";
import SelectionBox from "@/components/SelectionBox";
import { useTerminal } from "@/components/TerminalContext";
import Link from '@/components/Link';

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
      <div className="h-screen w-full bg-neutral-950 bg-grid-white/[0.021] relative flex items-center justify-center">
        <motion.div variants={fadeIn}>
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
          <div className="flex flex-col leading-relaxed text-primary">
						<p>
							i'm a 15 year old developer from <Link href={"https://www.google.com/maps/place/Mississauga,+ON,+Canada/@43.5774568,-79.6591567,11z/data=!3m1!4b1!4m6!3m5!1s0x882b469fe76b05b7:0x3146cbed75966db!8m2!3d43.5852972!4d-79.6449838!16zL20vMDE1NGd4?entry=ttu&g_ep=EgoyMDI0MDgyMC4xIKXMDSoASAFQAw%3D%3D"}>
              Mississauga, ON</Link> with a passion for engineering and problem solving.
						</p>
            <p className="mt-1">
              currently i'm a grade 11 IB student at <Link href="https://glenforest.peelschools.org/about-us">Glenforest SS</Link>.
              At the moment, i'm working at <Link href="futuremd.tech">FutureMD</Link>.
            </p>
            <p className="mt-1 justify-center items-center text-center">
              to learn more about me, click here!
            </p>
					</div>
            <File
              setWindowOpen={() => setIsTerminalOpen(true)}
              className="px-2"
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