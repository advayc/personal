import React, { useEffect, useRef, useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
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
  const dragControls = useDragControls();

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
  className={`terminal-container transition-all duration-300 ease-out ${isMinimized? 'hidden': isMobile ? 'w-screen h-[calc(100dvh-64px)]' : (isMaximized? 'w-[862px] h-[700px]':'w-[560px] h-[360px]')} ${isMobile ? 'rounded-none border-x-0' : 'rounded-lg'} fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden`}
  style={{ touchAction: 'none' }}
  initial={{ opacity: 0, scale: 0.95, top: isMobile ? Math.max(24, (typeof window!=='undefined'?window.innerHeight:700) * 0.23) : 32, left: isMobile ? Math.max(0, (typeof window!=='undefined'?window.innerWidth:900) * 0.06) : 64 }}
      animate={{ opacity: 1, scale: 1 }}
  drag
  dragControls={dragControls}
  dragListener={false}
  dragMomentum={false} dragElastic={0}
  dragConstraints={{ left: 0, top: 0, right: (typeof window!=='undefined'?window.innerWidth:0) - (isMobile? Math.min((typeof window!=='undefined'?window.innerWidth:560), 560): 560), bottom: (typeof window!=='undefined'?window.innerHeight:0) - (isMobile? Math.min((typeof window!=='undefined'?window.innerHeight:360), 360): 360) }}
  whileDrag={{ cursor: 'grabbing' }}
      data-snake-instance
    >
      <div className={`handle flex items-center justify-between bg-zinc-200 text-white px-4 ${isMobile ? 'py-2' : 'py-1'} ${isMobile ? '' : 'rounded-t-lg'} cursor-move`} onPointerDown={(e) => dragControls.start(e)}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 cursor-pointer" onClick={handleClose} />
          {!isMobile && (
            <>
              <div className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)} />
              <div className="w-3 h-3 bg-gprimary rounded-full hover:bg-green-600 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
            </>
          )}
        </div>
        <div className="flex-grow text-center text-black flex items-center justify-center">
          <img src="/icons/directory_closed.png" className="mr-2" alt="Directory" />
          <span className="font-medium text-[13px]">{headerText}</span>
        </div>
      </div>
      <div className="p-4 bg-[#151515] flex items-center justify-center" style={{height: isMobile ? 'calc(100% - 48px)' : (isMaximized? 'calc(100% - 32px)' : '328px')}}>
        <Snake width={isMobile ?  Math.max(280, Math.min((typeof window!=='undefined'?window.innerWidth:600) - 32, 560)) : (isMaximized? 800: 520)} height={isMobile ? Math.min(320, (typeof window!=='undefined'?window.innerHeight:500) * 0.45) : (isMaximized? 600: 280)} />
      </div>
  {/* No extra mobile footer controls */}
    </motion.div>
  );
};

export default SnakeTerminal;
