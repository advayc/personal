import React, { useEffect, useState } from 'react';

interface ShortcutHintProps {
  onOpen: () => void;
}

const ShortcutHint: React.FC<ShortcutHintProps> = ({ onOpen }) => {
  const [isMetaDown, setIsMetaDown] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsMetaDown(true);
      }
      if ((e.metaKey && e.key.toLowerCase() === 'k') || (e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onOpen();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) setIsMetaDown(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [onOpen]);

  return (
    <button
      onClick={onOpen}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#141414]/80 border border-white/10 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/20 transition-all text-lg font-mono"
      aria-label="Open command palette"
    >
      <span className={`transition-opacity ${isMetaDown ? 'opacity-0' : 'opacity-100'}`}>⌘ </span>
      <span className="text-s">+ K</span>
    </button>
  );
};

export default ShortcutHint;