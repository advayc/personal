import React, { useEffect, useState, useRef } from 'react';
import { FaLinkedin, FaGithub, FaFileAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdMail } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import Link from 'next/link';
import QueensWebring from './QueensWebring';

type ToggleOptionsType = 'light';

interface FooterProps {
    selected?: ToggleOptionsType;
    accentColorProp?: string;
    setAccentColorProp?: React.Dispatch<React.SetStateAction<string>>;
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
};

const Footer: React.FC<FooterProps> = ({ selected: propSelected, accentColorProp, setAccentColorProp }) => {
    const [internalSelected] = useState<ToggleOptionsType>('light');
    const [internalAccentColor, setInternalAccentColor] = useState('#22D3EE');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const selected = propSelected ?? internalSelected;
    const accentColor = accentColorProp ?? internalAccentColor;
    const setAccentColor = setAccentColorProp ?? setInternalAccentColor;

    useEffect(() => {
      const updateDateTime = () => {
        const now = new Date();
        const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
        setCurrentTime(estTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }));
        setCurrentDate(estTime.toISOString().split('T')[0]);
      };

      updateDateTime();
      const interval = setInterval(updateDateTime, 30000);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.style.setProperty('--accent-color', accentColor);
      const rgb = hexToRgb(accentColor);
      if (rgb) document.documentElement.style.setProperty('--accent-color-rgb', rgb);
    }, [selected, accentColor]);

    useEffect(() => {
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && showColorPicker) setShowColorPicker(false);
      };
      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }, [showColorPicker]);

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t border-white/5 py-2 sm:py-[9px] backdrop-blur-[2px]">
            <div className="flex items-center justify-between h-12 px-2 sm:px-0">
                <div className="w-[120px] sm:w-[200px] pl-2 sm:pl-3">
                    <QueensWebring site="advay.ca" />
                </div>

                <div className="flex items-center gap-1 sm:gap-1">
                    <Link
                        className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                        href="https://www.linkedin.com/in/advay/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaLinkedin className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                    <Link
                        className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                        href="https://x.com/advay_c"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaXTwitter className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                    <Link
                        className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                        href="https://www.github.com/advayc/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                    <Link
                        className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                        href="/resume.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Resume PDF"
                    >
                        <FaFileAlt className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                    <Link
                        className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                        href="mailto:advay.chandorkar@gmail.com"
                    >
                        <MdMail className="w-6 h-6 sm:w-7 sm:h-7" />
                    </Link>
                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="transition-colors duration-200 rounded-md p-2 sm:p-[15px] text-white/70 hover:text-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] outline-none"
                        >
                            <IoColorPaletteOutline className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                        {showColorPicker && (
                            <div className="absolute bottom-full right-0 mb-2 p-3 sm:p-4 bg-[#1E1E1E] rounded-lg border border-[#383838] shadow-2xl">
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
                                                    if (/^#[0-9A-F]{0,6}$/i.test(value)) setAccentColor(value);
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

                <div className="w-[120px] sm:w-[200px] flex justify-end pr-2 sm:pr-3">
                    <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                        <span className="font-medium text-xs sm:text-sm text-white/80">{currentTime}</span>
                        <span className="text-[10px] sm:text-xs text-white/60">{currentDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
