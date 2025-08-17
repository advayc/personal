import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Inter } from "next/font/google";
import Pong from '@/components/Pong';
import { useTerminal } from './TerminalContext';

const inter = Inter({ subsets: ["latin"] });

interface PongTerminalProps {
  onClose: () => void;
  headerText: string;
}

const PongTerminal: React.FC<PongTerminalProps> = ({
  onClose,
  headerText,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [showGame, setShowGame] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { setIsTerminalOpen } = useTerminal();
  const inputRef = useRef<HTMLDivElement>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState('');

  const selectedLineStyle = {
    backgroundColor: 'rgba(0, 255, 247, 0.175)',
  };

  const [dragConstraints, setDragConstraints] = useState({
    left: 0,
    top: 0,
    right: window.innerWidth - 560,
    bottom: window.innerHeight - 392
  });

  useEffect(() => {
    const updateConstraints = () => {
  const terminalWidth = isMaximized ? 862 : 560;
  const terminalHeight = isMaximized ? 700 : 360;
      setDragConstraints({
        left: 0,
        top: 0,
        right: window.innerWidth - terminalWidth,
        bottom: window.innerHeight - terminalHeight
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [isMaximized]);

  useEffect(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-color').trim();
    setAccentColor(color);
  }, []);

  const handleClose = () => {
    onClose();
    setIsTerminalOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showGame) return;
    e.stopPropagation();
    e.preventDefault();

    if (e.key === 'Enter') {
      if (input.trim().toLowerCase() === 'play') {
        setErrorMessage(`you forgot the semi-colon`);
        setInput('');
      }
      else if (input.trim().toLowerCase() === 'play;') {
        setErrorMessage('');
        setInput('');
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === 1) {
              clearInterval(countdownInterval);
              setShowGame(true);
              return null;
            }
            return prev ? prev - 1 : null;
          });
        }, 1000);
      } else {
        setErrorMessage(`Command not found: ${input}`);
        setInput('');
      }
      return;
    }

    if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setInput(prev => prev + e.key);
    }
  };

  useEffect(() => {
    if (!showGame) {
      inputRef.current?.focus();
    }
  }, [showGame]);

  const handleGameEnd = (winner: string) => {
    setTimeout(() => {
      setShowGame(false);
      setGameResult(winner === 'Player' ? 'win' : 'lose');
    }, 2000);
  };

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
          : "w-[560px] h-[360px]"
      } rounded-lg fixed z-50 font-mono text-sm border border-gray-800/50 rounded-b-lg bg-[#151515]/90 overflow-hidden focus:outline-none`}
      initial={{ opacity: 0, scale: 0.95, top: 32, left: 64 }}
      animate={
        isClosing 
          ? { 
              opacity: 0, 
              scale: 0.8,
              y: 100,
              rotate: -5,
              transition: { duration: 0.5, ease: "easeInOut" }
            }
          : { 
              opacity: 1, 
              scale: 1,
              y: 0,
              rotate: 0
            }
      }
      transition={{ duration: 0.2 }}
      drag
      dragMomentum={false}
      dragElastic={0}
  dragConstraints={dragConstraints}
      whileDrag={{ cursor: "grabbing" }}
      data-pong-instance
    >
      <div className="handle flex items-center justify-between bg-zinc-200 text-white px-4 py-1 rounded-t-lg cursor-move">
        <div className="flex space-x-2">
          <div
            className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleClose}
          />
          <div
            className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleMinimize}
          />
          <div
            className="relative w-3 h-3 bg-gprimary rounded-full hover:bg-green-600 transition-colors duration-200 cursor-pointer no-drag"
            onClick={handleMaximize}
          />
        </div>
        <div className="flex-grow text-center text-black flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-2" alt="Directory" />
          <span className="font-medium text-[13px]">{headerText}</span>
        </div>
      </div>
      <div 
        ref={inputRef}
        className="p-4 bg-[#151515] text-primary select-text overflow-y-auto rounded-b-lg custom-scrollbar focus:outline-none" 
        style={{ maxHeight: isMaximized ? "calc(100% - 32px)" : "368px" }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {!showGame && !gameResult && (
          <>
            <div className="flex items-center">
              <span className="text-gprimary mr-2">$</span>
              <span className="text-cyan-500 font-semibold">~/games/pong</span>
              <span className="text-[#2CCC12] font-semibold ml-2">main ✔</span>
            </div>
            
            <div className="flex mt-4">
              <span className="text-gprimary mr-2 font-mono">$</span>
              <span className="text-yellow-400 font-mono">echo</span>
              <span className="text-primary ml-2 font-mono leading-tight tracking-tight">
                don't type play;
              </span>
            </div>

            <div className="flex items-center mt-4">
              <span className="text-gprimary mr-2">$</span>
              <span className="text-white font-mono">{input}</span>
              <span className="animate-pulse ml-1 text-white">_</span>
            </div>

            {errorMessage && (
              <div className="flex items-center mt-2">
                <span className="text-red-500 font-mono">{errorMessage}</span>
              </div>
            )}
          </>
        )}

        {showGame && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden bg-transparent"
          >
            <Pong 
              width={isMaximized ? 800 : 520} 
              height={isMaximized ? 600 : 280}
              onGameEnd={handleGameEnd}
            />
          </motion.div>
        )}

        {gameResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center mt-8 space-y-4"
          >
            {gameResult === 'win' ? (
              <>
                <span className="text-4xl">🏆</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  Congratulations! You Won!
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-red-500">
                Game Over - You Lost!
              </span>
            )}
            <span className="text-gray-400 mt-2">
              Type 'play;' to play again
            </span>
          </motion.div>
        )}

        {countdown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <span className="text-6xl text-white font-bold">{countdown}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PongTerminal; 
