import React, { useEffect, useState, useRef } from 'react';
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import Link from 'next/link';
import { useSelectionBox, isElementInSelectionBox } from '@/components/SelectionContext';

type ToggleOptionsType = 'dark' | 'light';

interface FooterProps {
  selected?: ToggleOptionsType;
  setSelected?: React.Dispatch<React.SetStateAction<ToggleOptionsType>>;
}

const Footer: React.FC<FooterProps> = ({ selected: propSelected, setSelected: propSetSelected }) => {
    const [internalSelected, setInternalSelected] = useState<ToggleOptionsType>('light');
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
      if (selected === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      }
    }, [selected]);

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

    return (
        <div className="flex gap-12 fixed bottom-5">
            <Link
                ref={linkedInRef}
                className={`transition-colors duration-300 rounded-md p-[12px] ${isLinkedInSelected ? 'text-cyan-400 hover:bg-[#191919]' : 'hover:text-cyan-400 hover:bg-[#191919]'}`}
                href="https://www.linkedin.com/in/advay/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaLinkedin size={27} />
            </Link>
            <Link
                ref={githubRef}
                className={`transition-colors duration-300 rounded-md p-[12px] ${isGithubSelected ? 'text-cyan-400 hover:bg-[#191919]' : 'hover:text-cyan-400 hover:bg-[#191919]'}`}
                href="https://www.github.com/advayc/"
                target="_blank"
                rel="noopener noreferrer"
            >
                <FaGithub size={27} />
            </Link>
            <Link
                ref={mailRef}
                className={`transition-colors duration-300 rounded-md p-[12px] ${isMailSelected ? 'text-cyan-400 hover:bg-[#191919]' : 'hover:text-cyan-400 hover:bg-[#191919]'}`}
                href="mailto:advay.chandorkar@gmail.com"
            >
                <MdMail size={27} />
            </Link>
        </div>
    );
};

export default Footer;