import React, { useRef } from "react";
import clsx from "clsx";
import Image from 'next/image';

interface FileProps {
  setWindowOpen: () => void;
  className: string;
  filename: string;
  imageSrc: string;
  id?: string;
  eager?: boolean;
  onPrefetch?: () => void;
}

export default function File({
  setWindowOpen,
  className,
  filename,
  imageSrc,
  id,
  eager = false,
  onPrefetch,
}: FileProps) {
  const fileRef = useRef<HTMLDivElement>(null);

  const open = () => {
    if (filename === 'draw.exe') {
      const existingDraw = document.querySelector('[data-draw-instance]');
      if (!existingDraw) setWindowOpen();
      return;
    }
    setWindowOpen();
  };

  return (
    <div
      ref={fileRef}
      data-file-icon
      data-file-id={id}
      className={clsx(
        "cursor-pointer pt-2 border border-dotted border-transparent transition-colors duration-200",
        "hover:bg-[rgba(var(--accent-color-rgb),0.21)] hover:border-[var(--accent-color)] text-foreground"
      )}
      onMouseEnter={onPrefetch}
    >
      <button
        className={clsx("custom-focus w-full", className)}
        onClick={open}
        onDoubleClick={open}
      >
        <Image
          src={imageSrc}
          width={48}
          height={48}
          alt={filename}
          className="mx-auto"
          priority={eager}
        />
        <span className="block mt-1 text-[10px] text-center text-gray-300 font-semibold">
          {filename}
        </span>
      </button>
    </div>
  );
}
