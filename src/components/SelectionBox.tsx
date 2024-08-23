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
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        pointerEvents: 'none',
      }}
    />
  );
};

export default SelectionBox;