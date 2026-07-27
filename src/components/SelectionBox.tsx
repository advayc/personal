import React from 'react';
import { useSelectionBox } from './SelectionContext';
import { useTerminal } from './TerminalContext';

const SelectionBox: React.FC = () => {
  const selectionBox = useSelectionBox();
  const { isTerminalOpen } = useTerminal();

  if (isTerminalOpen || !selectionBox.isSelecting || selectionBox.width === 0 || selectionBox.height === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${selectionBox.left}px`,
        top: `${selectionBox.top}px`,
        width: `${selectionBox.width}px`,
        height: `${selectionBox.height}px`,
        backgroundColor: 'rgba(var(--accent-color-rgb), 0.28)',
        border: '1px solid rgba(var(--accent-color-rgb), 0.8)',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  );
};

export default SelectionBox;