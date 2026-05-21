import React, { useState, useEffect, useRef } from "react";
import { useTerminal } from './TerminalContext';
import Link from '@/components/Link';
import Image from 'next/image';
import { FaGithub } from 'react-icons/fa6';
import { FiExternalLink } from 'react-icons/fi';
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
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const { setIsTerminalOpen } = useTerminal();
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [showPong, setShowPong] = useState(false);
  const [input, setInput] = useState('');
  const pongRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { isTerminalOpen } = useTerminal();
  const [pongInstanceExists, setPongInstanceExists] = useState(false);
  const [position, setPosition] = useState({ x: 64, y: 64 });
  const [isMobile, setIsMobile] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>(
    '"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
  );
  const dragControls = useDragControls();

  useEffect(() => {
    const evalMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 700);
    evalMobile();
    window.addEventListener('resize', evalMobile);
    return () => window.removeEventListener('resize', evalMobile);
  }, []);

  useEffect(() => {
    try {
      const storedFont = localStorage.getItem('siteFontFamily');
      if (storedFont) setFontFamily(storedFont);
    } catch {}
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

  const calculateTotalLines = () => {
    const baseLines = 2;
    const itemCount = projects ? projects.length : (workExperience ? workExperience.length : 0);
    return baseLines + itemCount;
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
    const activeIndex = cursorPosition.y >= 2 ? cursorPosition.y - 2 : null;
    if (activeIndex === null) return;
    const target = itemRefs.current[activeIndex];
    if (target) {
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [cursorPosition.y]);

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

  const selectedLineStyle = { backgroundColor: 'rgba(0, 255, 247, 0.175)' };

  const renderProjectCard = (project: Project, index: number) => {
    const projectHref = project.projectLink || project.repoUrl;
    const activeItemIndex = cursorPosition.y >= 2 ? cursorPosition.y - 2 : null;
    const isSelected = activeItemIndex === index;

    return (
      <motion.article
        key={`${project.title}-${index}`}
        className={`group rounded-[14px] px-3 py-3 text-white transition hover:bg-white/5 ${isSelected ? 'bg-white/5' : ''}`}
        whileHover={{ y: -1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      >
        <div className="flex items-start justify-between gap-4">
          <a
            href={projectHref}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.title}`}
            tabIndex={0}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                (event.currentTarget as HTMLAnchorElement).click();
              }
            }}
            className="block text-[19px] font-semibold leading-tight tracking-tight text-white/95 transition duration-200 hover:text-white"
          >
            {project.title}
          </a>

          <div className="flex items-center gap-2 text-white/55">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} repository`}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    (event.currentTarget as HTMLAnchorElement).click();
                  }
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <FaGithub className="h-4 w-4" />
              </a>
            )}
            {project.projectLink && (
              <a
                href={project.projectLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} live site`}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    (event.currentTarget as HTMLAnchorElement).click();
                  }
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <FiExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <p className="mt-1 text-[13px] leading-6 text-white/60">
          {project.description}
        </p>

        <a
          href={projectHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${project.title}`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              (event.currentTarget as HTMLAnchorElement).click();
            }
          }}
          className="mt-3 block w-full max-w-[420px] overflow-hidden rounded-[12px]"
        >
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={project.imageSrc || '/projects/sitemaker.png'}
              alt={`${project.title} screenshot`}
              fill
              className="object-cover object-center transition duration-300 ease-out group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 90vw, 420px"
            />
          </div>
        </a>
      </motion.article>
    );
  };

  const renderExperienceCard = (experience: WorkExperience, index: number) => {
    const activeItemIndex = cursorPosition.y >= 2 ? cursorPosition.y - 2 : null;
    const isSelected = activeItemIndex === index;
    const shouldWrapDuration = isMaximized && !isMobile;
    const titleSizeClass = isMaximized && !isMobile ? 'text-[18px]' : 'text-[20px]';
    const companySizeClass = isMaximized && !isMobile ? 'text-[12px]' : 'text-[13px]';
    return (
      <motion.article key={`${experience.title}-${index}`}>
          <a
            href={experience.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${experience.company || experience.title}`}
            tabIndex={0}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              (event.currentTarget as HTMLAnchorElement).click();
            }
          }}
          className={`group relative flex items-start gap-2 rounded-[6px] px-1 py-1 text-white transition duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${isSelected ? 'bg-white/5' : ''}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative -mt-1 flex h-20 w-20 shrink-0 items-start justify-start overflow-hidden rounded-[10px]">
                  <Image
                    src={experience.imageSrc || '/experiences/neurotechuoft.png'}
                    alt={`${experience.company || experience.title} logo`}
                    fill
                    className="object-contain object-left p-1"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <div className={`${titleSizeClass} font-semibold leading-tight tracking-tight text-white/95 whitespace-normal break-words`}>
                    {experience.title}
                  </div>
                  <div className={`mt-0 ${companySizeClass} text-white/55 whitespace-normal break-words`}>{experience.company}</div>
                </div>
              </div>
              <span className={`ml-3 text-right text-[10px] uppercase tracking-[0.22em] text-white/35 ${shouldWrapDuration ? 'max-w-[140px] whitespace-normal break-words leading-[1.15]' : 'whitespace-nowrap'}`}>
                {experience.duration}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-white/60 w-full whitespace-normal break-words">
              {experience.description}
            </p>
          </div>
        </a>
      </motion.article>
    );
  };

  const renderProjects = () => {
    if (!projects) return null;

    const isWideLayout = isMaximized && !isMobile;

    return (
      <div className="mt-4">
        <div
          className="grid gap-6"
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
      <div className="mt-4">
        <div
          className="grid gap-6"
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
          style={{ maxHeight: "calc(100% - 32px)", fontFamily }}
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
      className={`terminal-container transition-all duration-300 ease-out ${
        isMinimized ? 'hidden' : isMobile ? 'w-[75vw] h-[40dvh]' : (isMaximized ? 'w-[862px] h-[700px]' : 'w-[600px] h-[400px]')
      } rounded-lg fixed z-50 text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden`}
      style={{ top: position.y, left: position.x, touchAction: 'none', fontFamily }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
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
        <div className="text-[12px] font-medium text-[#333] flex-1 min-w-0 text-center truncate flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-1 h-3.5 w-3.5" alt="Directory" />
          <span className="truncate">{headerText}</span>
        </div>
        <div className="w-16 shrink-0" />
      </div>
      {renderContent()}
    </motion.div>
  );
};

export default Terminal;
