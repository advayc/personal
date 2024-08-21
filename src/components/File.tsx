import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';

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
        <motion.img
          src="/computer.png" 
          draggable={false}
          initial={{
            opacity: 0,
            display: "none",
          }}
          animate={{
            opacity: 1,
            display: "block",
          }}
          transition={{ delay: 0.8, duration: 0.5 }}
          alt="Old Computer Icon"
          className="w-12 h-12 mx-auto"
        />
        <span className="block mt-1 text-[10px] text-center text-gray-300 font-semibold">
          learn.exe
        </span>
      </button>
    </div>
  );
}