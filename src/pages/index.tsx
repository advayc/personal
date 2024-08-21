import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import Terminal from "@/components/Terminal";
import File from "@/components/File";
import { motion } from "framer-motion";
import Link from 'next/link';
import { FaLinkedin, FaGithub } from "react-icons/fa";
import ToggleButton from '@/components/ToggleButton';

const inter = Inter({ subsets: ["latin"] });

type ToggleOptionsType = 'dark' | 'light';

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
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

  return (
    <main className={`${inter.className} flex items-center justify-center min-h-screen`}>
      <div className="h-screen w-full bg-neutral-950 bg-grid-white/[0.04] relative flex items-center justify-center">
        <div>
          <h1 className="text-5xl font-bold text-center text-white mb-8">Hi, I'm Advay!</h1>
          <div className="flex flex-col items-center justify-center space-y-2">
            <File
              setWindowOpen={setIsTerminalOpen}
              className="w-16 h-16"
            />
          </div>
          {isTerminalOpen && <Terminal onClose={() => setIsTerminalOpen(false)} />}
        </div>

          <div className="flex gap-12 fixed bottom-10">
            <Link
              className="hover:text-blue-500 transition-colors duration-300 p-[10px]"
              href="https://www.linkedin.com/in/advayc/"
              target="_blank"
            >
              <FaLinkedin size={27} />
            </Link>
            <Link
              className="hover:text-blue-500 transition-colors duration-300 p-[10px]"
              href="https://www.github.com/advayc/"
              target="_blank"
            >
              <FaGithub size={27} />
            </Link>
              <ToggleButton selected={selected} setSelected={setSelected}/>
          </div>
        </div>
    </main>
  );
}
