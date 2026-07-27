import React, { useEffect, useState } from 'react';
import QueensWebring from './QueensWebring';

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
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3">
      <button
        onClick={onOpen}
        className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-[#141414]/80 border border-[rgba(var(--text-rgb),0.1)] backdrop-blur-sm text-[rgba(var(--text-rgb),0.6)] hover:text-[rgba(var(--text-rgb))] hover:border-[rgba(var(--text-rgb),0.2)] transition-all text-xs font-mono"
        aria-label="Open command palette"
      >
        <span className={`transition-opacity ${isMetaDown ? 'opacity-0' : 'opacity-100'}`}>⌘ </span>
        <span className="text-xs">+ K</span>
      </button>
      <QueensWebring site="advay.ca" />
    </div>
  );
};

export default ShortcutHint;
