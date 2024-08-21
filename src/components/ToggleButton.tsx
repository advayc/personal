import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { useSelectionBox, isElementInSelectionBox } from '@/components/SelectionContext';

type ToggleOptionsType = 'dark' | 'light';

interface ToggleButtonProps {
  selected: ToggleOptionsType;
  setSelected: React.Dispatch<React.SetStateAction<ToggleOptionsType>>;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ selected, setSelected }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectionBox = useSelectionBox();
  const [isButtonSelected, setIsButtonSelected] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ToggleOptionsType | null;
    if (savedTheme) {
      setSelected(savedTheme);
    } else {
      setSelected('dark'); 
      localStorage.setItem('theme', 'dark');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (!isInputFocused) {
        if (event.key === 'm' || event.key === 'M') {
          toggleTheme();
        } else if (event.key === 'l' || event.key === 'L') {
          changeTheme('light');
        } else if (event.key === 'd' || event.key === 'D') {
          changeTheme('dark');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

  useEffect(() => {
    if (buttonRef.current) {
      setIsButtonSelected(isElementInSelectionBox(buttonRef.current, selectionBox));
    }
  }, [selectionBox]);

  const toggleTheme = () => {
    const newTheme = selected === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  const changeTheme = (newTheme: ToggleOptionsType) => {
    document.documentElement.classList.add('transition-colors');
    setSelected(newTheme);
    localStorage.setItem('theme', newTheme);
    setTimeout(() => {
      document.documentElement.classList.remove('transition-colors');
    }, 1500);
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={`flex items-center rounded-md p-[10px] border-none transition-colors duration-1500 ${
        selected === 'light'
          ? 'text-black hover:bg-gray-300'
          : 'text-white hover:bg-[#191919]'
      } ${isButtonSelected ? 'dark:bg-[#191919] transition-colors duration-1500' : ''}`}
    >
      <motion.div
        key={selected}
        initial={{ opacity: 0, rotate: 90 }}
        animate={{ opacity: 1, rotate: 0 }}
        exit={{ opacity: 0, rotate: -90 }}
        transition={{ duration: 1 }}
      >
        {selected === 'light' ? <MdOutlineLightMode className="text-2xl" /> : <MdOutlineDarkMode className="text-2xl" />}
      </motion.div>
    </button>
  );
};

export default ToggleButton;