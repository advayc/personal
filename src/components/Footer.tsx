import React, { useEffect, useState, useRef } from 'react';
import { FaLinkedin, FaGithub, FaFileAlt } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import Link from 'next/link';
import { useSelectionBox, isElementInSelectionBox } from '@/components/SelectionContext';

import HitCounter from './HitCounter';

type ToggleOptionsType = 'dark' | 'light';

interface FooterProps {
    selected?: ToggleOptionsType;
    setSelected?: React.Dispatch<React.SetStateAction<ToggleOptionsType>>;
    accentColorProp?: string;
    setAccentColorProp?: React.Dispatch<React.SetStateAction<string>>;
}

const Footer: React.FC<FooterProps> = ({ selected: propSelected, setSelected: propSetSelected, accentColorProp, setAccentColorProp }) => {
    const [internalSelected, setInternalSelected] = useState<ToggleOptionsType>('light');
        const [internalAccentColor, setInternalAccentColor] = useState('#22D3EE');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const selected = propSelected ?? internalSelected;
    const setSelected = propSetSelected ?? setInternalSelected;
        const accentColor = accentColorProp ?? internalAccentColor;
        const setAccentColor = setAccentColorProp ?? setInternalAccentColor;
    const selectionBox = useSelectionBox();

    const linkedInRef = useRef<HTMLAnchorElement>(null);
    const githubRef = useRef<HTMLAnchorElement>(null);
    const resumeRef = useRef<HTMLAnchorElement>(null);
    const mailRef = useRef<HTMLAnchorElement>(null);
    const colorPickerRef = useRef<HTMLButtonElement>(null);

    const [isLinkedInSelected, setIsLinkedInSelected] = useState(false);
    const [isGithubSelected, setIsGithubSelected] = useState(false);
    const [isResumeSelected, setIsResumeSelected] = useState(false);
    const [isMailSelected, setIsMailSelected] = useState(false);
    const [isColorPickerSelected, setIsColorPickerSelected] = useState(false);

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
      if (resumeRef.current) {
        setIsResumeSelected(isElementInSelectionBox(resumeRef.current, selectionBox));
      }
      if (mailRef.current) {
        setIsMailSelected(isElementInSelectionBox(mailRef.current, selectionBox));
      }
      if (colorPickerRef.current) {
        setIsColorPickerSelected(isElementInSelectionBox(colorPickerRef.current, selectionBox));
      }
    }, [selectionBox]);

    useEffect(() => {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && showColorPicker) {
          setShowColorPicker(false);
        }
      };

      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }, [showColorPicker]);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end pb-4 pointer-events-none">
            {/* macOS-style dock */}
            <div 
                className="flex items-center justify-center px-6 py-3 rounded-2xl pointer-events-auto glass-effect"
                style={{
                    minWidth: 'fit-content'
                }}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        ref={linkedInRef}
                        className={`transition-all duration-300 rounded-xl p-3 sm:p-4 hover:bg-[var(--accent-color-hover)] group relative ${
                            isLinkedInSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="https://www.linkedin.com/in/advay/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaLinkedin className="w-6 h-6 sm:w-7 sm:h-7 dock-icon" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            LinkedIn
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </Link>
                    <Link
                        ref={githubRef}
                        className={`transition-all duration-300 rounded-xl p-3 sm:p-4 hover:bg-[var(--accent-color-hover)] group relative ${
                            isGithubSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="https://www.github.com/advayc/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub className="w-6 h-6 sm:w-7 sm:h-7 dock-icon" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            GitHub
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </Link>
                    <Link
                        ref={resumeRef}
                        className={`transition-all duration-300 rounded-xl p-3 sm:p-4 hover:bg-[var(--accent-color-hover)] group relative ${
                            isResumeSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Resume PDF"
                    >
                        <FaFileAlt className="w-6 h-6 sm:w-7 sm:h-7 dock-icon" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            Resume
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </Link>
                    <Link
                        ref={mailRef}
                        className={`transition-all duration-300 rounded-xl p-3 sm:p-4 hover:bg-[var(--accent-color-hover)] group relative ${
                            isMailSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                        }`}
                        href="mailto:advay.chandorkar@gmail.com"
                    >
                        <MdMail className="w-6 h-6 sm:w-7 sm:h-7 dock-icon" />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            Email
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                    </Link>
                    <div className="relative">
                        <button
                            ref={colorPickerRef}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={`transition-all duration-300 rounded-xl p-3 sm:p-4 hover:bg-[var(--accent-color-hover)] outline-none group relative ${
                                isColorPickerSelected ? 'text-[var(--accent-color)]' : 'text-white/70 hover:text-[var(--accent-color)]'
                            }`}
                        >
                            <IoColorPaletteOutline className="w-6 h-6 sm:w-7 sm:h-7 dock-icon" />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                Settings
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </button>
                        {showColorPicker && (
                            <div className="absolute bottom-full right-0 mb-4 p-4 bg-[#1E1E1E] rounded-xl border border-[#383838] shadow-2xl">
                                <div className="flex flex-col gap-3">
                                    <div className="text-white/90 text-sm font-medium">Color</div>
                                    <div className="relative">
                                        <input
                                            type="color"
                                            title="Accent color picker"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] cursor-pointer rounded-lg"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 rounded-b-lg">
                                            <input
                                                type="text"
                                                title="Hex color value"
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
            </div>
            
            {/* Time display - positioned to the right */}
            <div className="absolute bottom-4 right-4 pointer-events-auto">
                <div className="flex flex-col items-end gap-1">
                    <span className="font-medium text-sm text-white/80">{currentTime}</span>
                    <span className="text-xs text-white/60">{currentDate}</span>
                </div>
            </div>
        </div>
    );
};

export default Footer;