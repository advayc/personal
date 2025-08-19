import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Snake from './Snake';
import { useTerminal } from './TerminalContext';

interface SnakeTerminalProps {
  onClose: () => void;
  headerText: string;
}

const SnakeTerminal: React.FC<SnakeTerminalProps> = ({ onClose, headerText }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { setIsTerminalOpen } = useTerminal();

  const handleClose = () => { onClose(); setIsTerminalOpen(false); };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <motion.div
      className={`terminal-container transition-all duration-300 ease-out ${isMinimized? 'hidden': isMaximized? 'w-[862px] h-[700px]':'w-[560px] h-[360px]'} rounded-lg fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95, 
        left: typeof window !== 'undefined' ? (window.innerWidth - (isMaximized ? 862 : 560)) / 2 : 300,
        top: typeof window !== 'undefined' ? (window.innerHeight - (isMaximized ? 700 : 360)) / 2 : 150
      }}
      animate={{ opacity: 1, scale: 1 }}
      drag dragMomentum={false} dragElastic={0}
      dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 560, bottom: window.innerHeight - 360 }}
      whileDrag={{ cursor: 'grabbing' }}
      data-snake-instance
    >
      <div className="handle flex items-center justify-between bg-zinc-200 text-white px-4 py-1 rounded-t-lg cursor-move">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 cursor-pointer" onClick={handleClose} />
          <div className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)} />
          <div className="w-3 h-3 bg-gprimary rounded-full hover:bg-green-600 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
        </div>
        <div className="flex-grow text-center text-black flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-2" alt="Directory" />
          <span className="font-medium text-[13px]">{headerText}</span>
        </div>
      </div>
      <div className="p-4 bg-[#151515] flex items-center justify-center" style={{height: isMaximized? 'calc(100% - 32px)' : '328px'}}>
        <Snake width={isMaximized? 800: 520} height={isMaximized? 600: 280} />
      </div>
    </motion.div>
  );
};

export default SnakeTerminal;
