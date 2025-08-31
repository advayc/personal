import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';
import Image from 'next/image';
import { Inter } from "next/font/google";
import PongTerminal from './PongTerminal';
const inter = Inter({ subsets: ["latin"] });

interface FileProps {
  setWindowOpen: (arg: boolean) => void;
  className: string;
  filename: string;
  imageSrc: string;
}

export default function File({
  setWindowOpen,
  className,
  filename,
  imageSrc,
}: FileProps) {
  const selectionBox = useSelectionBox();
  const fileRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (fileRef.current) {
      setIsSelected(isElementInSelectionBox(fileRef.current, selectionBox));
    }
  }, [selectionBox]);

  const handleClick = () => {
    if (filename === 'pong.exe') {
      const existingPong = document.querySelector('[data-pong-instance]');
      if (!existingPong) {
        setWindowOpen(true);
      }
    } else if (filename === 'draw.exe') {
      const existingDraw = document.querySelector('[data-draw-instance]');
      if (!existingDraw) {
        setWindowOpen(true);
      }
    } else {
      setWindowOpen(true);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Delay tooltip to avoid flickering
    setTimeout(() => setShowTooltip(true), 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  return (
    <div
      ref={fileRef}
      className={clsx(
        inter.className,
        "cursor-pointer pt-2 border border-dotted border-transparent transition-all duration-300 relative",
        "hover:bg-[rgba(var(--accent-color-rgb),0.21)] hover:border-[var(--accent-color)] text-white",
        isSelected && "bg-[rgba(var(--accent-color-rgb),0.1)] border-[var(--accent-color)]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={handleClick}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            scale: 1.15,
            transition: { duration: 0.2, ease: "easeOut" }
          }}
          className="relative"
        >
          <Image
            src={imageSrc}
            width={48}
            height={48}
            alt={filename}
            className="mx-auto file-icon"
            priority
            onLoadingComplete={() => setImageLoaded(true)}
          />
          
          {/* macOS-style glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent rounded-lg"
            animate={{
              boxShadow: isHovered 
                ? "0 0 20px rgba(var(--accent-color-rgb), 0.3)" 
                : "0 0 0px rgba(var(--accent-color-rgb), 0)"
            }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
        
        {imageLoaded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="block mt-1 text-[10px] text-center text-gray-300 font-semibold"
          >
            {filename}
          </motion.span>
        )}
      </button>

      {/* macOS-style tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-lg border border-gray-700/50 z-50 whitespace-nowrap"
          >
            {filename}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}