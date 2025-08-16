import React, { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import { useTerminal } from './TerminalContext';
import Link from '@/components/Link';
import { motion } from "framer-motion";
import Pong from '@/components/Pong';

interface Project {
  title: string;
  description: string;
  repoUrl: string;
  technologies: string;
  projectLink?: string; // optional live/demo link
}

interface WorkExperience {
  title: string;
  company?: string;
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
  isPong?: boolean;
}

const inter = Inter({ subsets: ["latin"] });

const Terminal: React.FC<TerminalProps> = ({
  onClose,
  headerText,
  pathText,
  branchText,
  infoText,
  projects,
  workExperience,
  isPong
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { setIsTerminalOpen } = useTerminal();
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  });
  const [showPong, setShowPong] = useState(false);
  const [input, setInput] = useState('');
  const pongRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { isTerminalOpen } = useTerminal();
  const [pongInstanceExists, setPongInstanceExists] = useState(false);

  useEffect(() => {
    if (isPong) {
      const existingPong = document.querySelector('[data-pong-instance]');
      if (existingPong) {
        onClose();
      } else {
        setPongInstanceExists(true);
      }
    }
  }, [isPong, onClose]);

  const handleClose = () => {
    if (isPong) {
      setPongInstanceExists(false);
    }
    onClose();
    setIsTerminalOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    let newPosition = { ...cursorPosition };
    const totalLines = calculateTotalLines();

    if (key === 'escape') {
      handleClose();
      return;
    }

    if (lastKeyPressed === 'y' && key === 'y') {
      setSelectedLine(cursorPosition.y);
      setLastKeyPressed(null);
      return;
    }

    setLastKeyPressed(key);

    switch (key) {
      case 'arrowup':
      case 'k':
        newPosition.y = Math.max(0, cursorPosition.y - 1);
        break;
      case 'arrowdown':
      case 'j':
        newPosition.y = Math.min(totalLines - 1, cursorPosition.y + 1);
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
    setSelectedLine(null);
    scrollToCursor();
  };

  const calculateTotalLines = () => {
    const baseLines = 2; // Path and echo lines
    const projectLines = projects ? projects.length * 3 : 0; // 3 lines per project
    const workExperienceLines = workExperience ? workExperience.length * 4 : 0; // 4 lines per work experience

    return baseLines + projectLines + workExperienceLines;
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
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isPong) {
        const key = event.key.toLowerCase();
        let newPosition = { ...cursorPosition };
        const totalLines = calculateTotalLines();

        if (key === 'escape') {
          handleClose();
          return;
        }

        if (lastKeyPressed === 'y' && key === 'y') {
          setSelectedLine(cursorPosition.y);
          setLastKeyPressed(null);
          return;
        }

        setLastKeyPressed(key);

        switch (key) {
          case 'arrowup':
          case 'k':
            newPosition.y = Math.max(0, cursorPosition.y - 1);
            break;
          case 'arrowdown':
          case 'j':
            newPosition.y = Math.min(totalLines - 1, cursorPosition.y + 1);
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
        setSelectedLine(null);
        scrollToCursor();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [cursorPosition, lastKeyPressed, isPong]);

  useEffect(() => {
    const updateConstraints = () => {
      const terminalWidth = isMaximized ? 862 : 600;
      const terminalHeight = isMaximized ? 700 : 400;

      setDragConstraints({
        left: 0,
        top: 0,
        right: window.innerWidth - terminalWidth,
        bottom: window.innerHeight - terminalHeight - 32 // Reduced bottom constraint
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [isMaximized]);

  const selectedLineStyle = {
    backgroundColor: 'rgba(0, 255, 247, 0.175)',
  };

  const renderProjects = () => {
    if (!projects) return null;

    return (
      <div className="mt-4 font-mono text-sm">
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div 
              className="flex items-center ml-4 mt-2"
              style={selectedLine === index + 2 ? selectedLineStyle : {}}
            >
              <span className="text-gprimary mr-2">$</span>
              <Link href={project.repoUrl}>{project.title}</Link>
              {project.projectLink && (
                <span className="ml-2 text-xs text-white/40 mr-4">[
                  <a
                    href={project.projectLink}
                    target="_blank"
                    className="text-[var(--accent-color)] hover:underline"
                  >live</a>]</span>
                  <span className="ml-2 text-xs text-white/40 mr-4">[
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    className="text-[var(--accent-color)] hover:underline"
                  >repository</a>]</span>
              )}
              {cursorPosition.y === index + 2 && cursorPosition.x === 0 && <span className="cursor"></span>}
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
            <div 
              className="flex items-center ml-4 mt-4"
              style={selectedLine === index + 2 ? selectedLineStyle : {}}
            >
              <span className="text-gprimary mr-2">$</span>
              <span className="text-gprimary font-semibold">{experience.title} at <Link href={experience.link}>{experience.company}</Link></span>
              {cursorPosition.y === index + 2 && cursorPosition.x === 0 && <span className="cursor"></span>}
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

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isPong) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (isPong) {
      window.addEventListener('keydown', handleKeyPress, true);
      return () => window.removeEventListener('keydown', handleKeyPress, true);
    }
  }, [isPong]);

  const handleTerminalInput = (e: React.KeyboardEvent) => {
    if (!isPong || showPong) return;
    
    e.stopPropagation();
    e.preventDefault();

    if (e.key === 'Enter') {
      if (input.trim().toLowerCase() === 'play;') {
        setShowPong(true);
        setInput('');
        setTimeout(() => {
          if (pongRef.current) {
            pongRef.current.focus();
          }
        }, 100);
      }
      return;
    }

    if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setInput(prev => prev + e.key);
    }
  };

  const handleTerminalClick = () => {
    if (isPong && !showPong) {
      terminalRef.current?.focus();
    }
  };

  useEffect(() => {
    if (isPong && !showPong) {
      terminalRef.current?.focus();
    }
  }, [isPong, showPong]);

  const renderPongTerminal = () => {
    return (
      <div 
        className="flex-1 bg-black rounded-b-lg overflow-hidden"
        data-pong-instance
        tabIndex={0}
        style={{ height: isMaximized ? "calc(100% - 32px)" : "368px" }}
      >
        <Pong 
          width={isMaximized ? 800 : 550} 
          height={isMaximized ? 600 : 300}
          onGameEnd={() => {}}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isPong) {
      return (
        <div className="flex flex-col h-full">
          {renderPongTerminal()}
        </div>
      );
    }
    
    return (
      <div 
        ref={terminalRef}
        className="p-4 bg-[#151515] text-primary select-text overflow-y-auto rounded-b-lg custom-scrollbar" 
        style={{ maxHeight: isMaximized ? "calc(100% - 32px)" : "368px" }}
      >
        <div 
          className="flex items-center"
          style={selectedLine === 0 ? selectedLineStyle : {}}
        >
          <span className="text-gprimary mr-2">$</span>
          <span className="text-cyan-500 font-semibold">{pathText}</span>
          <span className="text-[#2CCC12] font-semibold ml-2">{branchText}</span>
          {cursorPosition.y === 0 && <span className="cursor"></span>}
        </div>
        <div 
          className="flex mt-4"
          style={selectedLine === 1 ? selectedLineStyle : {}}
        >
          <span className="text-gprimary mr-2 font-mono">$</span>
          <span className="text-yellow-400 font-mono">echo</span>
          <span className="text-primary ml-2 font-mono leading-tight tracking-tight">{infoText}</span>
          {cursorPosition.y === 1 && <span className="cursor"></span>}
        </div>
        {projects ? renderProjects() : renderWorkExperience()}
      </div>
    );
  };

  useEffect(() => {
    if (isPong && !showPong && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPong, showPong]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      className={`terminal-container ${inter.className} transition-all duration-300 ease-out ${
        isMinimized
          ? "hidden"
          : isMaximized
          ? "w-[862px] h-[700px]"
          : "w-[600px] h-[400px]"
      } rounded-lg fixed z-50 font-mono text-sm border border-gray-800/50 rounded-b-lg bg-[#151515]/90 overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95, top: 64, left: 64 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 600, bottom: window.innerHeight - 400 }}
      whileDrag={{ cursor: "grabbing" }}
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
          ></div>
        </div>
        <div className="flex-grow text-center text-black flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-2" alt="Directory" />
          <span className="font-medium text-[13px]">{headerText}</span>
        </div>
      </div>
      {renderContent()}
    </motion.div>
  );
};

export default Terminal;
