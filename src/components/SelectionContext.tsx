import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { useTerminal } from './TerminalContext';

interface SelectionBoxState {
  isSelecting: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
}

const emptySelection: SelectionBoxState = {
  isSelecting: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
};

const SelectionBoxContext = createContext<SelectionBoxState>(emptySelection);

export const useSelectionBox = () => useContext(SelectionBoxContext);

const isEventInAnyTerminal = (target: EventTarget | null): boolean => {
  if (!(target instanceof Node)) return false;
  const terminalElements = document.querySelectorAll('.terminal-container');
  return Array.from(terminalElements).some((element) => element.contains(target));
};

const setSelectionVars = (left: number, top: number, width: number, height: number) => {
  document.documentElement.style.setProperty('--selection-left', `${left}px`);
  document.documentElement.style.setProperty('--selection-top', `${top}px`);
  document.documentElement.style.setProperty('--selection-width', `${width}px`);
  document.documentElement.style.setProperty('--selection-height', `${height}px`);
};

const clearSelectionVars = () => {
  document.documentElement.style.removeProperty('--selection-left');
  document.documentElement.style.removeProperty('--selection-top');
  document.documentElement.style.removeProperty('--selection-width');
  document.documentElement.style.removeProperty('--selection-height');
};

export const SelectionBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>(emptySelection);
  const { isTerminalOpen, isDragging } = useTerminal();
  const isSelectingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const terminalOpenRef = useRef(isTerminalOpen);
  const draggingRef = useRef(isDragging);

  useEffect(() => {
    terminalOpenRef.current = isTerminalOpen;
    draggingRef.current = isDragging;
  }, [isTerminalOpen, isDragging]);

  useEffect(() => {
    const clearSelectionBox = () => {
      isSelectingRef.current = false;
      setSelectionBox(emptySelection);
      document.body.classList.remove('selecting');
      document.body.style.userSelect = '';
      clearSelectionVars();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isSelectingRef.current || terminalOpenRef.current || draggingRef.current || isEventInAnyTerminal(event.target)) {
        return;
      }

      const left = Math.min(startRef.current.x, event.clientX);
      const top = Math.min(startRef.current.y, event.clientY);
      const width = Math.abs(event.clientX - startRef.current.x);
      const height = Math.abs(event.clientY - startRef.current.y);
      setSelectionVars(left, top, width, height);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (terminalOpenRef.current || draggingRef.current || isEventInAnyTerminal(event.target)) return;

      isSelectingRef.current = true;
      startRef.current = { x: event.clientX, y: event.clientY };
      setSelectionBox({
        isSelecting: true,
        left: event.clientX,
        top: event.clientY,
        width: 0,
        height: 0,
      });
      document.body.classList.add('selecting');
      setSelectionVars(event.clientX, event.clientY, 0, 0);
    };

    const handleMouseUp = () => {
      if (!isSelectingRef.current) return;
      clearSelectionBox();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearSelectionBox();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <SelectionBoxContext.Provider value={selectionBox}>
      {children}
    </SelectionBoxContext.Provider>
  );
};

export const isElementInSelectionBox = (element: HTMLElement, selectionBox: SelectionBoxState) => {
  if (!selectionBox.isSelecting) return false;
  const rect = element.getBoundingClientRect();
  return (
    rect.left < selectionBox.left + selectionBox.width &&
    rect.right > selectionBox.left &&
    rect.top < selectionBox.top + selectionBox.height &&
    rect.bottom > selectionBox.top
  );
};
