import React, { createContext, useContext, useState } from 'react';

interface TerminalContextType {
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  cursorPosition: { x: number; y: number };
  setCursorPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
}

const TerminalContext = createContext<TerminalContextType | undefined>(undefined);

export const TerminalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  return (
    <TerminalContext.Provider value={{ 
      isTerminalOpen, 
      setIsTerminalOpen, 
      isDragging, 
      setIsDragging,
      cursorPosition,
      setCursorPosition
    }}>
      {children}
    </TerminalContext.Provider>
  );
};

export const useTerminal = () => {
  const context = useContext(TerminalContext);
  if (context === undefined) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
};