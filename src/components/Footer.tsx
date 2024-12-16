import React, { useEffect, useState, useRef } from 'react';
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import Link from 'next/link';
import { useSelectionBox, isElementInSelectionBox } from '@/components/SelectionContext';

type ToggleOptionsType = 'dark' | 'light';

interface FooterProps {
  selected?: ToggleOptionsType;
  setSelected?: React.Dispatch<React.SetStateAction<ToggleOptionsType>>;
}

const Footer: React.FC<FooterProps> = ({ selected: propSelected, setSelected: propSetSelected }) => {
    const [internalSelected, setInternalSelected] = useState<ToggleOptionsType>('light');
    const [accentColor, setAccentColor] = useState('#22D3EE');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const selected = propSelected ?? internalSelected;
    const setSelected = propSetSelected ?? setInternalSelected;
    const selectionBox = useSelectionBox();

    const linkedInRef = useRef<HTMLAnchorElement>(null);
    const githubRef = useRef<HTMLAnchorElement>(null);
    const mailRef = useRef<HTMLAnchorElement>(null);

    const [isLinkedInSelected, setIsLinkedInSelected] = useState(false);
    const [isGithubSelected, setIsGithubSelected] = useState(false);
    const [isMailSelected, setIsMailSelected] = useState(false);

    useEffect(() => {
      const updateDateTime = () => {
        const now = new Date();
        const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        
        const timeStr = estTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const dateStr = estTime.toISOString().split('T')[0];
        
        setCurrentTime(timeStr);
        setCurrentDate(dateStr);
      };

      updateDateTime();
      const interval = setInterval(updateDateTime, 1000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      if (selected === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
      
      document.documentElement.style.setProperty('--accent-color', accentColor);
      document.documentElement.style.setProperty('--accent-color-rgb', hexToRgb(accentColor));
    }, [selected, accentColor]);

    useEffect(() => {
      if (linkedInRef.current) {
        setIsLinkedInSelected(isElementInSelectionBox(linkedInRef.current, selectionBox));
      }
      if (githubRef.current) {
        setIsGithubSelected(isElementInSelectionBox(githubRef.current, selectionBox));
      }
      if (mailRef.current) {
        setIsMailSelected(isElementInSelectionBox(mailRef.current, selectionBox));
      }
    }, [selectionBox]);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };

    return (
        <div 
            className="fixed bottom-0 left-0 right-0 border-t border-white/5 py-[9px]"
            style={{
                backgroundColor: ``,
                backdropFilter: 'blur(2px)'
            }}
        >
            <div className="flex items-center justify-between h-12">
                <div className="w-[200px]" />
                
                <div className="flex items-center gap-1">
                    <Link
                        ref={linkedInRef}
                        className={`transition-all duration-300 rounded-md p-[15px] hover:bg-[var(--accent-color-hover)] ${
                            isLinkedInSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="https://www.linkedin.com/in/advay/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaLinkedin size={28} />
                    </Link>
                    <Link
                        ref={githubRef}
                        className={`transition-all duration-300 rounded-md p-[15px] hover:bg-[var(--accent-color-hover)] ${
                            isGithubSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="https://www.github.com/advayc/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub size={28} />
                    </Link>
                    <Link
                        ref={mailRef}
                        className={`transition-all duration-300 rounded-md p-[15px] hover:bg-[var(--accent-color-hover)] ${
                            isMailSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="mailto:advay.chandorkar@gmail.com"
                    >
                        <MdMail size={28} />
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`transition-all duration-300 rounded-md p-[15px] hover:bg-[var(--accent-color-hover)] ${
                                showColorPicker ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                            }`}
                        >
                            <IoColorPaletteOutline size={28} />
                        </button>
                        {showColorPicker && (
                            <div className="absolute bottom-full right-0 mb-2 p-4 bg-[#1E1E1E] rounded-lg border border-[#383838] shadow-2xl">
                                <div className="flex flex-col gap-3">
                                    <div className="text-white/90 text-sm font-medium">Color</div>
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-[200px] h-[200px] cursor-pointer rounded-lg"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 rounded-b-lg">
                                            <input
                                                type="text"
                                                value={accentColor.toUpperCase()}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                                                        setAccentColor(value);
                                                    }
                                                }}
                                                className="w-full bg-transparent text-white border-none outline-none text-sm"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['#22D3EE', '#F472B6', '#A78BFA', '#34D399', '#F59E0B'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setAccentColor(color)}
                                                className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="w-[200px] flex justify-end pr-3">
                    <div className="flex flex-col items-end">
                        <span className="font-medium text-sm text-white/80">{currentTime}</span>
                        <span className="text-xs text-white/60">{currentDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;