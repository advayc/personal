import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function File({
  setWindowOpen,
  className,
}: {
  setWindowOpen: (arg: boolean) => void;
  className: string;
}) {
  return (
    <div className="cursor-pointer pt-2 focus:bg-blue-700/50 focus:border-blue-500 hover:bg-blue-700/50 hover:border-blue-500 border border-dotted border-transparent hover:text-white">
    <button
      className={clsx(
        "",
        className
      )}
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
