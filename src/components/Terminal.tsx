import React, { useState, useEffect, useRef } from "react";
import { Inter } from "next/font/google";
import { useTerminal } from './TerminalContext';
import Link from '@/components/Link';
import Image from 'next/image';
import { FaGithub } from 'react-icons/fa6';
import { motion, useDragControls } from "framer-motion";
import Pong from '@/components/Pong';

interface Project {
  title: string;
  description: string;
  repoUrl: string;
  technologies: string;
  projectLink?: string;
  imageSrc?: string;
}

interface WorkExperience {
  title: string;
  company?: string;
  duration: string;
  description: string;
  technologies?: string;
  link: string;
  imageSrc?: string;
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
  initialX?: number;
  initialY?: number;
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
  isPong,
  initialX,
  initialY
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
  const [position, setPosition] = useState({ x: 64, y: 64 });
  const [isMobile, setIsMobile] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    const evalMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 700);
    evalMobile();
    window.addEventListener('resize', evalMobile);
    return () => window.removeEventListener('resize', evalMobile);
  }, []);

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

  const handleMinimize = () => setIsMinimized(!isMinimized);
  const handleMaximize = () => setIsMaximized(!isMaximized);

  const getTerminalDimensions = () => {
    if (typeof window === 'undefined') {
      return { width: 600, height: 400 };
    }

    if (isMobile) {
      return {
        width: window.innerWidth * 0.75,
        height: window.innerHeight * 0.4
      };
    }

    return {
      width: isMaximized ? 862 : 600,
      height: isMaximized ? 700 : 400
    };
  };

  const clampPosition = (nextPosition: { x: number; y: number }, width: number, height: number) => {
    if (typeof window === 'undefined') {
      return nextPosition;
    }

    return {
      x: Math.max(0, Math.min(nextPosition.x, window.innerWidth - width)),
      y: Math.max(0, Math.min(nextPosition.y, window.innerHeight - height))
    };
  };

  const calculateTotalLines = () => {
    const baseLines = 2;
    const projectLines = projects ? projects.length * 3 : 0;
    const workExperienceLines = workExperience ? workExperience.length * 4 : 0;
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
      const { width: terminalWidth, height: terminalHeight } = getTerminalDimensions();

      setDragConstraints({
        left: 0,
        top: 0,
        right: Math.max(0, window.innerWidth - terminalWidth),
        bottom: Math.max(0, window.innerHeight - terminalHeight)
      });

      if (typeof window !== 'undefined') {
        const hasManual = typeof initialX === 'number' && typeof initialY === 'number' && initialX! >= 0 && initialY! >= 0;
        if (!hasManual) {
          const baseX = Math.max(0, (window.innerWidth - terminalWidth) / 2);
          const baseY = Math.max(24, (window.innerHeight - terminalHeight) / 2);
          if (isMobile) {
            setPosition({ x: baseX, y: baseY });
          } else {
            setPosition(prev => {
              const movedFar = Math.hypot(prev.x - baseX, prev.y - baseY) > 200;
              return movedFar ? prev : { x: baseX, y: baseY };
            });
          }
        }
      }
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [isMaximized, isMobile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasManual = typeof initialX === 'number' && typeof initialY === 'number' && initialX! >= 0 && initialY! >= 0;
    if (hasManual) {
      setPosition({ x: initialX as number, y: initialY as number });
    } else {
      const mobile = window.innerWidth < 700;
      const terminalWidth = mobile ? window.innerWidth * 0.75 : (isMaximized ? 862 : 600);
      const terminalHeight = mobile ? window.innerHeight * 0.4 : (isMaximized ? 700 : 400);
      const baseX = Math.max(0, (window.innerWidth - terminalWidth) / 2);
      const baseY = Math.max(24, (window.innerHeight - terminalHeight) / 2);
      setPosition({ x: baseX, y: baseY });
    }
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const recenter = () => {
  // Match mobile terminal dimensions used elsewhere (75vw x 40vh)
  const w = window.innerWidth * 0.9;
  const h = window.innerHeight * 0.5;
      const baseX = Math.max(0, (window.innerWidth - w) / 2);
      const baseY = Math.max(24, (window.innerHeight - h) / 2);
  const hasManual = typeof initialX === 'number' && typeof initialY === 'number' && initialX! >= 0 && initialY! >= 0;
  if (!hasManual) setPosition({ x: baseX, y: baseY });
    };
    window.addEventListener('resize', recenter);
    return () => window.removeEventListener('resize', recenter);
  }, [isMobile]);

  const selectedLineStyle = { backgroundColor: 'rgba(0, 255, 247, 0.175)' };

  const renderProjectCard = (project: Project, index: number) => {
    const projectHref = project.projectLink || project.repoUrl;
    const techList = project.technologies.split(',').map((tech) => tech.trim()).filter(Boolean);

    return (
      <motion.article
        key={`${project.title}-${index}`}
        className="group overflow-hidden rounded-[28px] border border-black/10 bg-[#f5efe2] text-[#1f1813] shadow-[0_18px_40px_rgba(0,0,0,0.14)]"
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="relative overflow-hidden border-b border-black/10">
          <a
            href={projectHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.title}`}
            className="relative block aspect-[16/10] w-full overflow-hidden"
          >
            <Image
              src={project.imageSrc || '/projects/sitemaker.png'}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-[1.03]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0 opacity-0 transition duration-500 group-hover:opacity-100" />
          </a>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            {project.projectLink && (
              <span className="rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#725442] backdrop-blur-sm">
                live
              </span>
            )}
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.title} repository`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/75 bg-white/90 text-[#1b1b1b] shadow-[0_6px_18px_rgba(0,0,0,0.16)] transition duration-300 hover:scale-110 hover:bg-white"
            >
              <FaGithub className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7d6a59]">project</p>
              <h3 className="mt-2 text-2xl font-semibold leading-[0.95] tracking-tight sm:text-[28px]">
                <a href={projectHref} target="_blank" rel="noreferrer" className="transition duration-300 hover:text-[var(--accent-color)]">
                  {project.title}
                </a>
              </h3>
            </div>
            <span className="rounded-full border border-black/10 bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6d5d4f]">
              project
            </span>
          </div>

          <p className="max-w-[40rem] text-sm leading-7 text-[#5f5347] sm:text-[15px]">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {techList.map((tech) => (
              <span
                key={`${project.title}-${tech}`}
                className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#665546]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    );
  };

  const renderExperienceCard = (experience: WorkExperience, index: number) => {
    return (
      <motion.article
        key={`${experience.title}-${index}`}
        className="group overflow-hidden rounded-[28px] border border-black/10 bg-[#f4ede1] text-[#1f1813] shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="grid gap-0 lg:grid-cols-[0.96fr_1.04fr]">
          <a
            href={experience.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${experience.company}`}
            className="relative block min-h-[220px] overflow-hidden lg:min-h-[100%]"
          >
            <Image
              src={experience.imageSrc || '/experiences/neurotech.png'}
              alt={`${experience.company} screenshot`}
              fill
              className="object-cover object-center transition duration-500 ease-out group-hover:scale-[1.04] group-hover:brightness-[1.03]"
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/22 via-black/0 to-black/0 opacity-0 transition duration-500 group-hover:opacity-100" />
            <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#725442] backdrop-blur-sm">
              experience
            </div>
          </a>

          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#7d6a59]">experience</p>
                <h3 className="mt-2 text-[26px] font-semibold leading-[1] tracking-tight sm:text-[30px]">
                  {experience.title}
                </h3>
                {experience.company && (
                  <p className="mt-2 text-base font-medium text-[#493d33]">
                    at <Link href={experience.link} className="text-[#2d241e]">{experience.company}</Link>
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-black/10 bg-white/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6d5d4f]">
                {experience.duration}
              </span>
            </div>

            <p className="max-w-[40rem] text-sm leading-7 text-[#5f5347] sm:text-[15px]">
              {experience.description}
            </p>

            {experience.technologies && (
              <div className="flex flex-wrap gap-2">
                {experience.technologies.split(',').map((tech) => (
                  <span
                    key={`${experience.title}-${tech.trim()}`}
                    className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#665546]"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    );
  };

  const handleTerminalDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    const { width, height } = getTerminalDimensions();
    setPosition((prev) => clampPosition({
      x: prev.x + info.offset.x,
      y: prev.y + info.offset.y
    }, width, height));
  };

  const renderProjects = () => {
    if (!projects) return null;

    const isWideLayout = isMaximized && !isMobile;

    return (
      <div className="mt-4 space-y-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: isWideLayout ? 'repeat(2, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))' }}
        >
          {projects.map((project, index) => renderProjectCard(project, index))}
        </div>
      </div>
    );
  };

  const renderWorkExperience = () => {
    if (!workExperience) return null;

    const isWideLayout = isMaximized && !isMobile;

    return (
      <div className="mt-4 space-y-4">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: isWideLayout ? 'repeat(2, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))' }}
        >
          {workExperience.map((experience, index) => renderExperienceCard(experience, index))}
        </div>
      </div>
    );
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isPong) {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    if (isPong) {
      window.addEventListener('keydown', handleKeyPress, true);
      return () => window.removeEventListener('keydown', handleKeyPress, true);
    }
  }, [isPong, handleClose]);

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
    const mobileWidth = Math.max(260, Math.min(typeof window !== 'undefined' ? Math.floor(window.innerWidth * 0.76) : 340, 520));
    const mobileHeight = Math.max(160, Math.min(typeof window !== 'undefined' ? Math.floor(window.innerHeight * 0.3) : 220, 320));
    return (
      <div 
        className="flex-1 bg-black rounded-b-lg overflow-hidden"
        data-pong-instance
        tabIndex={0}
        style={{ height: "calc(100% - 32px)" }}
      >
        <Pong 
          width={isMobile ? mobileWidth : (isMaximized ? 800 : 550)} 
          height={isMobile ? mobileHeight : (isMaximized ? 600 : 300)}
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
        className="p-4 bg-[#151515] text-primary select-text overflow-y-auto custom-scrollbar" 
        style={{ maxHeight: "calc(100% - 32px)" }}
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
        isMinimized ? 'hidden' : isMobile ? 'w-[75vw] h-[40dvh]' : (isMaximized ? 'w-[862px] h-[700px]' : 'w-[600px] h-[400px]')
      } rounded-lg fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden`}
      style={{ top: position.y, left: position.x, touchAction: 'none' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={dragConstraints}
      onDragEnd={handleTerminalDragEnd}
      whileDrag={{ cursor: "grabbing" }}
    >
      <div 
        className={`handle flex items-center justify-between text-white px-3 ${isMobile ? 'py-2' : 'py-[6px]'} ${isMobile ? '' : 'rounded-t-lg'} cursor-move select-none border-b border-[#a7a7a7]`}
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.4), rgba(255,255,255,0.4) 1px, rgba(240,240,240,0.4) 1px, rgba(240,240,240,0.4) 3px), linear-gradient(to bottom, #f6f6f6, #d6d6d6)'
        }}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          // Avoid starting drag on buttons/links inside header
          if (target.closest('button,a')) return;
          dragControls.start(e);
        }}
      >
        <div className="flex items-center space-x-[6px] select-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close"
            className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(0,0,0,0.45)]"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #ffb3ad 0%, #ff5f56 60%, #e33d2e 100%)'
            }}
          >
            <span className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                  }} />
            <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0))'
                  }} />
          </button>
          {!isMobile && (
            <>
              <div
                aria-hidden
                className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #ffe0a1 0%, #ffbd2e 60%, #d79b1e 100%)'
                }}
              >
                <span className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                      }} />
                <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))'
                      }} />
              </div>
              <button
                type="button"
                aria-label="Maximize"
                title="Maximize"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMaximize();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="relative w-[14px] h-[14px] rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.25),inset_0_0_0_1px_rgba(0,0,0,0.4)] cursor-pointer"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #b6f0c1 0%, #27ca3f 60%, #16a42b 100%)'
                }}
              >
                <span className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.0) 60%)'
                      }} />
                <span className="absolute top-0 left-0 right-0 h-[30%] rounded-t-full"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))'
                      }} />
              </button>
            </>
          )}
        </div>
        <div className="text-[13px] font-medium text-[#333] flex-1 text-center truncate flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-2" alt="Directory" />
          <span>{headerText}</span>
        </div>
        <div className="w-16" />
      </div>
      {renderContent()}
    </motion.div>
  );
};

export default Terminal;
