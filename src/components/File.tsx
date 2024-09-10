import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSelectionBox, isElementInSelectionBox } from './SelectionContext';
import Image from 'next/image';
import { Inter } from "next/font/google";
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

  return (
    <div
      ref={fileRef}
      className={clsx(
        inter.className,
        "cursor-pointer pt-2 border border-dotted border-transparent hover:bg-cyan-950 hover:border-cyan-500 text-white",
        isSelected && "bg-cyan-950 border-cyan-500"
      )}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={() => setWindowOpen(true)}
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