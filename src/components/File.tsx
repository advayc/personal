import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  return (
    <motion.div
      ref={fileRef}
      className={clsx(
        inter.className,
        "cursor-pointer pt-2 border border-dotted border-transparent transition-all duration-300 rounded-lg p-2",
        "hover:bg-[rgba(var(--accent-color-rgb),0.15)] hover:border-[var(--accent-color)] text-white",
        isSelected && "bg-[rgba(var(--accent-color-rgb),0.2)] border-[var(--accent-color)]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        boxShadow: isHovered 
          ? `0 8px 32px rgba(var(--accent-color-rgb), 0.3), 0 0 0 1px rgba(var(--accent-color-rgb), 0.2)`
          : isSelected
          ? `0 4px 16px rgba(var(--accent-color-rgb), 0.2), 0 0 0 1px rgba(var(--accent-color-rgb), 0.1)`
          : '0 2px 8px rgba(0, 0, 0, 0.1)',
        backdropFilter: isHovered ? 'blur(10px)' : 'blur(5px)',
        background: isHovered 
          ? `linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.15), rgba(var(--accent-color-rgb), 0.05))`
          : isSelected
          ? `linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1), rgba(var(--accent-color-rgb), 0.02))`
          : 'rgba(255, 255, 255, 0.02)'
      }}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={handleClick}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Image
            src={imageSrc}
            width={48}
            height={48}
            alt={filename}
            className="mx-auto drop-shadow-lg"
            priority
            onLoadingComplete={() => setImageLoaded(true)}
            style={{
              filter: isHovered 
                ? `drop-shadow(0 0 8px rgba(var(--accent-color-rgb), 0.6))`
                : isSelected
                ? `drop-shadow(0 0 4px rgba(var(--accent-color-rgb), 0.4))`
                : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
            }}
          />
          {/* Glow effect overlay */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, rgba(var(--accent-color-rgb), 0.2) 0%, transparent 70%)`,
                filter: 'blur(8px)'
              }}
            />
          )}
        </motion.div>
        {imageLoaded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="block mt-1 text-[10px] text-center text-gray-300 font-semibold"
            style={{
              textShadow: isHovered 
                ? `0 0 8px rgba(var(--accent-color-rgb), 0.8)`
                : isSelected
                ? `0 0 4px rgba(var(--accent-color-rgb), 0.6)`
                : 'none'
            }}
          >
            {filename}
          </motion.span>
        )}
      </button>
    </motion.div>
  );
}