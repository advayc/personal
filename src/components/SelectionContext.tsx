import React, { useEffect, useState, createContext, useContext } from 'react';
import { useTerminal } from './TerminalContext';

interface SelectionBoxState {
  isSelecting: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

const SelectionBoxContext = createContext<SelectionBoxState>({
  isSelecting: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});

export const useSelectionBox = () => useContext(SelectionBoxContext);

export const SelectionBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>({
    isSelecting: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });
  const { isTerminalOpen } = useTerminal();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (selectionBox.isSelecting && !isTerminalOpen) {
        updateSelectionBox(
          { x: selectionBox.left, y: selectionBox.top },
          { x: event.clientX, y: event.clientY }
        );
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!isTerminalOpen) {
        setSelectionBox({
          isSelecting: true,
          left: event.clientX,
          top: event.clientY,
          width: 0,
          height: 0,
        });
        document.body.classList.add('selecting');
        document.body.style.userSelect = 'none';
      }
    };

    const handleMouseUp = () => {
      clearSelectionBox();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelectionBox();
      }
    };

    const updateSelectionBox = (start: { x: number; y: number }, end: { x: number; y: number }) => {
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      setSelectionBox({ isSelecting: true, left, top, width, height });

      document.documentElement.style.setProperty('--selection-left', `${left}px`);
      document.documentElement.style.setProperty('--selection-top', `${top}px`);
      document.documentElement.style.setProperty('--selection-width', `${width}px`);
      document.documentElement.style.setProperty('--selection-height', `${height}px`);
    };

    const clearSelectionBox = () => {
      setSelectionBox({
        isSelecting: false,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      });
      document.body.classList.remove('selecting');
      document.body.style.userSelect = '';
      resetSelectionBox();
    };

    const resetSelectionBox = () => {
      document.documentElement.style.removeProperty('--selection-left');
      document.documentElement.style.removeProperty('--selection-top');
      document.documentElement.style.removeProperty('--selection-width');
      document.documentElement.style.removeProperty('--selection-height');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectionBox.isSelecting, isTerminalOpen]);

  return (
    <SelectionBoxContext.Provider value={selectionBox}>
      {children}
    </SelectionBoxContext.Provider>
  );
};

export const isElementInSelectionBox = (element: HTMLElement, selectionBox: SelectionBoxState) => {
  const rect = element.getBoundingClientRect();
  return (
    selectionBox.isSelecting &&
    rect.left < selectionBox.left + selectionBox.width &&
    rect.right > selectionBox.left &&
    rect.top < selectionBox.top + selectionBox.height &&
    rect.bottom > selectionBox.top
  );
};