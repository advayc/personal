import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';
import Image from 'next/image';
import { Inter } from "next/font/google";
import { useTerminal } from './TerminalContext';
const inter = Inter({ subsets: ["latin"] });

interface FileProps {
  setWindowOpen: (arg: boolean) => void;
  className: string;
  filename: string;
  imageSrc: string;
  // Free-move mode props
  id?: string;
  freeMoveEnabled?: boolean;
  position?: { x: number; y: number };
  onPositionChange?: (pos: { x: number; y: number }) => void;
  snapSize?: number;
}

export default function File({
  setWindowOpen,
  className,
  filename,
  imageSrc,
  id,
  freeMoveEnabled,
  position,
  onPositionChange,
  snapSize = 32,
}: FileProps) {
  const selectionBox = useSelectionBox();
  const fileRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setIsDragging } = useTerminal();

  // local controlled drag state for free-move
  const [xy, setXy] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (freeMoveEnabled && position) {
      setXy(position);
    }
  }, [freeMoveEnabled, position?.x, position?.y]);

  useEffect(() => {
    if (fileRef.current) {
      setIsSelected(isElementInSelectionBox(fileRef.current, selectionBox));
    }
  }, [selectionBox]);

  const open = () => {
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

  const handleClick = () => {
    // In free move mode, single click should not open; double-click opens instead
    if (!freeMoveEnabled) open();
  };

  const content = (
    <div
      ref={fileRef}
      data-file-icon
      data-file-id={id}
      className={clsx(
        inter.className,
        "cursor-pointer pt-2 border border-dotted border-transparent transition-all duration-200",
        "hover:bg-[rgba(var(--accent-color-rgb),0.21)] hover:border-[var(--accent-color)] text-white",
        isSelected && "bg-[rgba(var(--accent-color-rgb),0.1)] border-[var(--accent-color)]"
      )}
      onMouseDown={(e) => {
        if (freeMoveEnabled) {
          // prevent desktop selection box from starting
          e.stopPropagation();
        }
        setIsSelected(true);
      }}
      onMouseUp={() => setIsSelected(false)}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={handleClick}
        onDoubleClick={open}
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
            onLoad={() => setImageLoaded(true)}
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

  if (!freeMoveEnabled) return content;

  return (
    <motion.div
      className="absolute z-20"
      animate={{ x: xy.x, y: xy.y }}
      transition={{ type: 'spring', stiffness: 380, damping: 20, mass: 0.6 }}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        const rawX = xy.x + info.offset.x;
        const rawY = xy.y + info.offset.y;
        const snapped = {
          x: Math.round(rawX / snapSize) * snapSize,
          y: Math.round(rawY / snapSize) * snapSize,
        };
        const nx = Number.isFinite(snapped.x) ? snapped.x : xy.x;
        const ny = Number.isFinite(snapped.y) ? snapped.y : xy.y;
        setXy({ x: nx, y: ny });
        onPositionChange && onPositionChange({ x: nx, y: ny });
      }}
    >
      {content}
    </motion.div>
  );
}