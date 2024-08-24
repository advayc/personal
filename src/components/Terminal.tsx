import React, { useState, useEffect } from "react";
import { motion, useDragControls } from "framer-motion";
import { Inter } from "next/font/google";
import { useTerminal } from './TerminalContext';

interface TerminalProps {
  onClose: () => void;
  headerText: string;
  pathText: string;
  branchText: string;
}

const inter = Inter({ subsets: ["latin"] });

const Terminal: React.FC<TerminalProps> = ({ onClose, headerText, pathText, branchText }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHoveringMaximize, setIsHoveringMaximize] = useState(false);
  const dragControls = useDragControls();
  const { setIsTerminalOpen, setIsDragging } = useTerminal();

  const handleClose = () => {
    onClose();
    setIsTerminalOpen(false);
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const handleMinimize = () => {
    onClose();
    setIsTerminalOpen(false);
    document.activeElement instanceof HTMLElement && document.activeElement.blur();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F' || event.key === 'f') {
        handleMaximize();
      } else if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMaximized]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className={`terminal-container ${inter.className} ${
        isMinimized
          ? "hidden"
          : isMaximized
          ? "w-[862px] h-[500px]"
          : "w-[600px] h-[400px]"
      } rounded-lg fixed top-16 left-16 z-50 font-mono text-sm border-gray-800 rounded-b-lg`}
    >
      <motion.div 
        className="flex items-center justify-between bg-zinc-200 text-white px-4 py-1 rounded-t-lg cursor-move"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex space-x-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 transition-colors duration-200 cursor-pointer"
            onClick={handleClose}
          ></motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 transition-colors duration-200 cursor-pointer"
            onClick={handleMinimize}
          ></motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-3 h-3 bg-[#29CA40] rounded-full hover:bg-green-600 transition-colors duration-200 cursor-pointer"
            onClick={handleMaximize}
            onMouseEnter={() => setIsHoveringMaximize(true)}
            onMouseLeave={() => setIsHoveringMaximize(false)}
          ></motion.div>
        </div>
        <div className="flex-grow text-center text-black">
          <span className="font-medium text-[13px]">
            {headerText}
          </span>
        </div>
      </motion.div>

      <div className="p-4 bg-[#151515] text-white">
        <span className="text-cyan-500 font-semibold">{pathText} </span>
        <span className="text-[#2CCC12] font-semibold">{branchText}</span>
        <div className="mt-1 text-2xl text-white">▸</div>
      </div>
    </motion.div>
  );
};

export default Terminal;