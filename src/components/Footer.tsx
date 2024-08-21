import React, { useEffect, useState } from 'react';
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import ToggleButton from '@/components/ToggleButton';
import Link from 'next/link';

type ToggleOptionsType = 'dark' | 'light';

interface FooterProps {
  selected?: ToggleOptionsType;
  setSelected?: React.Dispatch<React.SetStateAction<ToggleOptionsType>>;
}

const Footer: React.FC<FooterProps> = ({ selected: propSelected, setSelected: propSetSelected }) => {
    const [internalSelected, setInternalSelected] = useState<ToggleOptionsType>('light');

    const selected = propSelected ?? internalSelected;
    const setSelected = propSetSelected ?? setInternalSelected;

    useEffect(() => {
      if (selected === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }, [selected]);

    return (
        <div className="flex gap-12 fixed bottom-5">
            <Link
                className="hover:text-cyan-400 transition-colors duration-300 p-[10px]"
                href="https://www.linkedin.com/in/advayc/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaLinkedin size={27} />
            </Link>
            <Link
                className="hover:text-cyan-400 transition-colors duration-300 p-[10px]"
                href="https://www.github.com/advayc/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaGithub size={27} />
            </Link>
            <Link
                className="hover:text-cyan-400 transition-colors duration-300 p-[10px]"
                href="mailto:advay.chandorkar@gmail.com"
            >
                <MdMail size={27} />
            </Link>
            <ToggleButton selected={selected} setSelected={setSelected} />
        </div>
    );
};

export default Footer;