import React, { useState, useEffect, useRef } from 'react';
import { FaLinkedin, FaGithub, FaFileAlt } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { IoColorPaletteOutline } from "react-icons/io5";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface MacOSTaskbarProps {
  selected?: 'dark' | 'light';
  setSelected?: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  accentColorProp?: string;
  setAccentColorProp?: React.Dispatch<React.SetStateAction<string>>;
}

const MacOSTaskbar: React.FC<MacOSTaskbarProps> = ({ 
  selected: propSelected, 
  setSelected: propSetSelected, 
  accentColorProp, 
  setAccentColorProp 
}) => {
  const [internalSelected, setInternalSelected] = useState<'dark' | 'light'>('light');
  const [internalAccentColor, setInternalAccentColor] = useState('#22D3EE');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  
  const selected = propSelected ?? internalSelected;
  const setSelected = propSetSelected ?? setInternalSelected;
  const accentColor = accentColorProp ?? internalAccentColor;
  const setAccentColor = setAccentColorProp ?? setInternalAccentColor;

  const colorPickerRef = useRef<HTMLButtonElement>(null);

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

  const taskbarItems = [
    {
      id: 'linkedin',
      icon: FaLinkedin,
      href: 'https://www.linkedin.com/in/advay/',
      label: 'LinkedIn',
      external: true
    },
    {
      id: 'github',
      icon: FaGithub,
      href: 'https://www.github.com/advayc/',
      label: 'GitHub',
      external: true
    },
    {
      id: 'resume',
      icon: FaFileAlt,
      href: '/resume.pdf',
      label: 'Resume',
      external: true
    },
    {
      id: 'mail',
      icon: MdMail,
      href: 'mailto:advay.chandorkar@gmail.com',
      label: 'Email',
      external: false
    },
    {
      id: 'colorpicker',
      icon: IoColorPaletteOutline,
      href: '#',
      label: 'Color Picker',
      external: false,
      action: () => setShowColorPicker(!showColorPicker)
    }
  ];

  const renderIcon = (item: typeof taskbarItems[0]) => {
    const IconComponent = item.icon;
    const isHovered = hoveredIcon === item.id;
    
    return (
      <motion.div
        key={item.id}
        className="relative flex flex-col items-center"
        onMouseEnter={() => setHoveredIcon(item.id)}
        onMouseLeave={() => setHoveredIcon(null)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 px-3 py-1 bg-gray-800/90 text-white text-sm rounded-lg whitespace-nowrap z-50"
              style={{
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {item.label}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icon Container */}
        <motion.div
          className="w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            background: isHovered 
              ? `linear-gradient(135deg, rgba(${hexToRgb(accentColor)}, 0.2), rgba(${hexToRgb(accentColor)}, 0.1))`
              : 'rgba(255, 255, 255, 0.05)',
            border: isHovered 
              ? `1px solid rgba(${hexToRgb(accentColor)}, 0.3)`
              : '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: isHovered 
              ? `0 8px 32px rgba(${hexToRgb(accentColor)}, 0.3)`
              : '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}
          whileHover={{
            y: -4,
            transition: { duration: 0.2 }
          }}
        >
          {item.action ? (
            <button
              onClick={item.action}
              className="w-full h-full flex items-center justify-center"
            >
              <IconComponent 
                className="w-6 h-6" 
                style={{ 
                  color: isHovered ? accentColor : 'rgba(255, 255, 255, 0.8)' 
                }} 
              />
            </button>
          ) : (
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className="w-full h-full flex items-center justify-center"
            >
              <IconComponent 
                className="w-6 h-6" 
                style={{ 
                  color: isHovered ? accentColor : 'rgba(255, 255, 255, 0.8)' 
                }} 
              />
            </Link>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Main Taskbar */}
      <motion.div
        className="flex justify-center pb-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-2xl"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          {taskbarItems.map(renderIcon)}
        </div>
      </motion.div>

      {/* Color Picker Popup */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(30, 30, 30, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="text-white/90 text-sm font-medium">Color</div>
                <div className="relative">
                  <input
                    type="color"
                    title="Accent color picker"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-[160px] h-[160px] cursor-pointer rounded-lg"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Display */}
      <div className="absolute bottom-4 right-4 text-right">
        <div className="text-white/80 text-sm font-medium">{currentTime}</div>
        <div className="text-white/60 text-xs">{currentDate}</div>
      </div>
    </div>
  );
};

export default MacOSTaskbar;