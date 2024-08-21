import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';
import Image from 'next/image';

export default function File({
  setWindowOpen,
  className,
}: {
  setWindowOpen: (arg: boolean) => void;
  className: string;
}) {
  const selectionBox = useSelectionBox();
  const fileRef = useRef<HTMLDivElement>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (fileRef.current) {
      setIsSelected(isElementInSelectionBox(fileRef.current, selectionBox));
    }
  }, [selectionBox]);

  return (
    <div
      ref={fileRef}
      className={clsx(
        "cursor-pointer pt-2 border border-dotted border-transparent",
        isSelected && "bg-cyan-700/50 border-cyan-500 text-white",
        !isSelected && "focus:bg-cyan-700/50 focus:border-cyan-500 hover:bg-cyan-700/50 hover:border-cyan-500 hover:text-white"
      )}
    >
      <button
        className={clsx("", className)}
        onClick={() => setWindowOpen(true)}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/computer.png"
            width={48}
            height={48}
            alt="Old Computer Icon"
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
            learn.exe
          </motion.span>
        )}
      </button>
    </div>
  );
}