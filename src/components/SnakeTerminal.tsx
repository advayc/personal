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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const evalMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < 700);
    evalMobile();
    window.addEventListener('resize', evalMobile);
    return () => window.removeEventListener('resize', evalMobile);
  }, []);

  const handleClose = () => { onClose(); setIsTerminalOpen(false); };

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  return (
    <motion.div
      className={`terminal-container transition-all duration-300 ease-out ${isMinimized? 'hidden': isMobile ? 'w-screen h-[70vh]' : (isMaximized? 'w-[862px] h-[700px]':'w-[560px] h-[360px]')} ${isMobile ? 'rounded-none border-x-0' : 'rounded-lg'} fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95, top: isMobile ? 0 : 32, left: isMobile ? 0 : 64 }}
      animate={{ opacity: 1, scale: 1 }}
      drag={!isMobile} dragMomentum={false} dragElastic={0}
      dragConstraints={isMobile ? undefined : { left: 0, top: 0, right: window.innerWidth - 560, bottom: window.innerHeight - 360 }}
      whileDrag={{ cursor: isMobile ? 'default' : 'grabbing' }}
      data-snake-instance
    >
      <div className={`handle flex items-center justify-between bg-zinc-200 text-white px-4 ${isMobile ? 'py-2' : 'py-1'} ${isMobile ? '' : 'rounded-t-lg'} cursor-move`}>
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
      <div className="p-4 bg-[#151515] flex items-center justify-center" style={{height: isMobile ? 'calc(100% - 48px)' : (isMaximized? 'calc(100% - 32px)' : '328px')}}>
        <Snake width={isMobile ?  (window.innerWidth - 32) : (isMaximized? 800: 520)} height={isMobile ? Math.min(300, window.innerHeight * 0.45) : (isMaximized? 600: 280)} />
      </div>
      {isMobile && (
        <div className="w-full bg-[#111111] text-[10px] text-center py-1 border-t border-white/5 flex items-center justify-center gap-4">
          <button onClick={() => setIsMaximized(!isMaximized)} className="px-2 py-1 rounded bg-zinc-800 text-white/80 hover:bg-zinc-700 text-[10px]">{isMaximized ? 'shrink' : 'expand'}</button>
          <button onClick={handleClose} className="px-2 py-1 rounded bg-zinc-800 text-white/80 hover:bg-zinc-700 text-[10px]">close</button>
        </div>
      )}
    </motion.div>
  );
};

export default SnakeTerminal;
