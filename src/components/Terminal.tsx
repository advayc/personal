import React, { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import { useTerminal } from './TerminalContext';
import Link from '@/components/Link';
import { motion } from "framer-motion";

interface Project {
  title: string;
  description: string;
  repoUrl: string;
  technologies: string;
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  technologies?: string;
  link: string;
}

interface TerminalProps {
  onClose: () => void;
  headerText: string;
  pathText: string;
  branchText: string;
  infoText: string;
  projects?: Project[];
  workExperience?: WorkExperience[];
}

const inter = Inter({ subsets: ["latin"] });

const Terminal: React.FC<TerminalProps> = ({ onClose, headerText, pathText, branchText, infoText, projects, workExperience }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHoveringMaximize, setIsHoveringMaximize] = useState(false);
  const { setIsTerminalOpen } = useTerminal();
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 2 }); // Start after the initial content
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onClose();
      setIsTerminalOpen(false);
      document.activeElement instanceof HTMLElement && document.activeElement.blur();
    }, 300);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'F' || event.key === 'f') {
      handleMaximize();
    } else if (event.key === 'Escape' || event.key === 'C' || event.key === 'c') {
      handleClose();
    }

    const key = event.key.toLowerCase();
    let newPosition = { ...cursorPosition };
    const contentLength = 2 + (projects?.length || workExperience?.length || 0);

    switch (key) {
      case 'arrowup':
      case 'k':
        newPosition.y = Math.max(0, cursorPosition.y - 1);
        break;
      case 'arrowdown':
      case 'j':
        newPosition.y = Math.min(contentLength - 1, cursorPosition.y + 1);
        break;
      case 'arrowleft':
      case 'h':
        newPosition.x = Math.max(0, cursorPosition.x - 1);
        break;
      case 'arrowright':
      case 'l':
        newPosition.x = cursorPosition.x + 1;
        break;
    }

    setCursorPosition(newPosition);
    scrollToCursor();
  };

  const scrollToCursor = () => {
    if (terminalRef.current) {
      const lineHeight = 24; 
      const cursorY = cursorPosition.y * lineHeight;
      const scrollTop = terminalRef.current.scrollTop;
      const viewportHeight = terminalRef.current.clientHeight;

      if (cursorY < scrollTop) {
        terminalRef.current.scrollTop = cursorY;
      } else if (cursorY > scrollTop + viewportHeight - lineHeight) {
        terminalRef.current.scrollTop = cursorY - viewportHeight + lineHeight;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cursorPosition]);

  const renderProjects = () => {
    if (!projects) return null;

    return (
      <div className="mt-4 font-mono text-sm">
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex items-center ml-4 mt-2">
              <span className="text-gprimary mr-2">$</span>
              <Link href={project.repoUrl}>{project.title}</Link>
              {cursorPosition.y === index + 2 && cursorPosition.x === 0 && <span className="bg-yellow-500 text-black animate-blink">&nbsp;</span>}
            </div>
            <div className="text-gray-300 mt-1 ml-8">{project.description}</div>
            <div className="text-primary mt-1 text-center italic">technologies used <span className="text-gprimary">-{">"}</span> {project.technologies}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderWorkExperience = () => {
    if (!workExperience) return null;

    return (
      <div className="mt-4 font-mono text-sm">
        {workExperience.map((experience, index) => (
          <div key={index} className="mb-4">
            <div className={`flex items-center ml-4 mt-4`}>
              <span className="text-gprimary mr-2">$</span>
              <span className="text-gprimary font-semibold">{experience.title} at <Link href={experience.link}>{experience.company}</Link></span>
              {cursorPosition.y === index + 2 && cursorPosition.x === 0 && <span className="bg-yellow-500 text-black animate-blink">&nbsp;</span>}
            </div>
            <div className="text-primary mt-1 ml-8">{experience.duration}</div>
            <div className="text-gray-300 mt-1 ml-8">{experience.description}</div>
            {experience.technologies && (
              <div className="text-primary mt-1 mb-6 text-center italic">Skills <span className="text-yellow-500">-{">"}</span> {experience.technologies}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className={`terminal-container ${inter.className} transition-opacity duration-300 ease-in-out ${
        isMinimized
          ? "hidden"
          : isMaximized
          ? "w-[862px] h-[700px]"
          : "w-[600px] h-[400px]"
      } rounded-lg fixed top-16 left-16 z-50 font-mono text-sm border-gray-800 rounded-b-lg ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
      initial={{ opacity: 1, x: 0, y: 0 }}
      animate={{ opacity: isFadingOut ? 0 : 1 }}
      drag
      dragElastic={0} 
      dragConstraints={{
        left: -60,
        top: -80,
        right: 840,
        bottom: 230
      }} 
    >
      <div 
        className="handle flex items-center justify-between bg-zinc-200 text-white px-4 py-1 rounded-t-lg cursor-move"
      >
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleClose}
          ></div>
          <div
            className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleMinimize}
          ></div>
          <div
            className="relative w-3 h-3 bg-gprimary rounded-full hover:bg-green-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleMaximize}
            onMouseEnter={() => setIsHoveringMaximize(true)}
            onMouseLeave={() => setIsHoveringMaximize(false)}
          ></div>
        </div>
        <div className="flex-grow text-center text-black flex items-center justify-center">
          <img src="/directory_closed.png" className="mr-2" alt="Directory" />
          <span className="font-medium text-[13px]">{headerText}</span>
        </div>
      </div>

      <div 
        ref={terminalRef}
        className="p-4 bg-[#151515] text-primary select-text overflow-y-auto rounded-b-lg custom-scrollbar" 
        style={{ maxHeight: isMaximized ? "calc(100% - 32px)" : "368px" }}
      >
        <div className="flex items-center">
          <span className="text-gprimary mr-2">$</span>
          <span className="text-cyan-500 font-semibold">{pathText}</span>
          <span className="text-[#2CCC12] font-semibold ml-2">{branchText}</span>
          {cursorPosition.y === 0 && <span className="bg-yellow-500 text-black animate-blink">&nbsp;</span>}
        </div>
        <div className="flex mt-4">
          <span className="text-gprimary mr-2 font-mono">$</span>
          <span className="text-yellow-400 font-mono">echo</span>
          <span className="text-primary ml-2 font-mono leading-tight tracking-tight">{infoText}</span>
          {cursorPosition.y === 1 && <span className="bg-yellow-500 text-black animate-blink">&nbsp;</span>}
        </div>
        {projects ? renderProjects() : renderWorkExperience()}
      </div>
    </motion.div>
  );
};

export default Terminal;