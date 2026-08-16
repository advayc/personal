import React from 'react';
import { Internet } from './Internet';
import { motion, useDragControls } from 'framer-motion';
import { useState } from 'react';

interface InternetTerminalProps {
  onClose: () => void;
  headerText: string;
}

export default function InternetTerminal({ onClose, headerText }: InternetTerminalProps) {
  const dragControls = useDragControls();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(false);
    setIsMaximized(false);
  };

  if (isMinimized) return null;

  return (
    <motion.div
      className={`terminal-container fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden rounded-lg`}
      style={{
        width: isMaximized ? 'calc(100vw - 24px)' : 'min(820px, calc(100vw - 24px))',
        height: isMaximized ? 'calc(100vh - 24px)' : 'min(600px, calc(100vh - 24px))',
        top: 48,
        left: 'max(12px, min(64px, calc(100vw - 844px)))',
        touchAction: 'none',
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        top: 0,
        right: typeof window !== 'undefined' ? Math.max(0, window.innerWidth - (isMaximized ? 862 : 820)) : 0,
        bottom: typeof window !== 'undefined' ? Math.max(0, window.innerHeight - (isMaximized ? 700 : 600)) : 0,
      }}
    >
      <div className="w-full h-full bg-transparent">
        <Internet
          onClose={onClose}
          onMinimize={handleMinimize}
          onToggleMaximize={() => setIsMaximized(!isMaximized)}
          onDragHandlePointerDown={(e) => dragControls.start(e)}
        />
      </div>
    </motion.div>
  );
}
