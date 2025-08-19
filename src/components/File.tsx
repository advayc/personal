import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';
import Image from 'next/image';
import PongTerminal from './PongTerminal';

// Use system fonts instead of Google Fonts due to network restrictions
const inter = { className: "font-mono" };

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
        "cursor-pointer pt-2 border border-dotted border-transparent transition-all duration-300",
        "hover:bg-[rgba(var(--accent-color-rgb),0.21)] hover:border-[var(--accent-color)] text-white",
        isSelected && "bg-[rgba(var(--accent-color-rgb),0.1)] border-[var(--accent-color)]"
      )}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={handleClick}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={imageSrc}
            width={48}
            height={48}
            alt={filename}
            className="mx-auto"
            priority
            onLoadingComplete={() => setImageLoaded(true)}
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
    </div>
  );
}