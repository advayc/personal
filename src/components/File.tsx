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
    <div
      ref={fileRef}
      className={clsx(
        inter.className,
        "cursor-pointer pt-2 border border-dotted border-transparent transition-all duration-300 relative group",
        "hover:bg-[rgba(var(--accent-color-rgb),0.15)] hover:border-[var(--accent-color)] text-white",
        isSelected && "bg-[rgba(var(--accent-color-rgb),0.12)] border-[var(--accent-color)]",
        isSelected && "file-glow"
      )}
    >
      {/* Enhanced glow effect */}
      <div 
        className={clsx(
          "absolute inset-0 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-[rgba(var(--accent-color-rgb),0.1)] to-[rgba(var(--accent-color-rgb),0.05)]"
        )}
        style={{
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
          zIndex: -1
        }}
      />
      
      <button
        className={clsx("custom-focus w-full relative z-10", className)}
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
            className="mx-auto transition-transform duration-300 group-hover:scale-110"
            priority
            onLoadingComplete={() => setImageLoaded(true)}
          />
          {/* Icon glow effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle, rgba(var(--accent-color-rgb), 0.3) 0%, transparent 70%)`,
              filter: 'blur(4px)',
              transform: 'scale(1.2)'
            }}
          />
        </motion.div>
        {imageLoaded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="block mt-1 text-[10px] text-center text-gray-300 font-semibold transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_4px_rgba(var(--accent-color-rgb),0.6)]"
          >
            {filename}
          </motion.span>
        )}
      </button>
    </div>
  );
}