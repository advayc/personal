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

  const BASE_WIDTH = 820;
  const BASE_HEIGHT = 600;
  const MAXIMIZE_WIDTH_FACTOR = 1.6; // 70% wider

  const width = Math.round(BASE_WIDTH * (isMaximized ? MAXIMIZE_WIDTH_FACTOR : 1));
  const height = BASE_HEIGHT; // keep height fixed when maximizing horizontally
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 0;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 0;

  if (isMinimized) return null;

  return (
    <motion.div
      className={`terminal-container fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/90 overflow-hidden rounded-lg`}
      style={{ width, height, top: 4, left: 20, touchAction: 'none' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, top: 0, right: viewportW - width, bottom: viewportH - height }}
    >
      <div className="w-full h-full bg-transparent">
        <Internet
          onClose={onClose}
          onDragHandlePointerDown={(e) => dragControls.start(e)}
          onToggleMaximize={() => setIsMaximized(v => !v)}
        />
      </div>
    </motion.div>
  );
}
