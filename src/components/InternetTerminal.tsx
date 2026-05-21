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

  if (isMinimized) return null;

  return (
    <motion.div
      className={`terminal-container fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden rounded-lg`}
      style={{ width: isMaximized ? 862 : 820, height: isMaximized ? 700 : 600, top: 48, left: 64, touchAction: 'none' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, top: 0, right: (typeof window!=='undefined'?window.innerWidth:0) - (isMaximized? 862: 820), bottom: (typeof window!=='undefined'?window.innerHeight:0) - (isMaximized? 700: 600) }}
    >
      <div className="w-full h-full bg-transparent">
        <Internet
          onClose={onClose}
          onDragHandlePointerDown={(e) => dragControls.start(e)}
        />
      </div>
    </motion.div>
  );
}
