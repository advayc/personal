import { useEffect, useState } from 'react';

const MouseTracker = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown) {
        setCurrentPosition({ x: event.clientX, y: event.clientY });
        updateSelectionBox(startPosition, { x: event.clientX, y: event.clientY });
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      setIsMouseDown(true);
      setStartPosition({ x: event.clientX, y: event.clientY });
      setCurrentPosition({ x: event.clientX, y: event.clientY });
      document.body.classList.add('selecting');
      document.body.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
      resetSelectionBox();
      document.body.classList.remove('selecting');
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown, startPosition]);

  const updateSelectionBox = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    document.documentElement.style.setProperty('--selection-left', `${left}px`);
    document.documentElement.style.setProperty('--selection-top', `${top}px`);
    document.documentElement.style.setProperty('--selection-width', `${width}px`);
    document.documentElement.style.setProperty('--selection-height', `${height}px`);
  };

  const resetSelectionBox = () => {
    document.documentElement.style.setProperty('--selection-left', `0px`);
    document.documentElement.style.setProperty('--selection-top', `0px`);
    document.documentElement.style.setProperty('--selection-width', `0px`);
    document.documentElement.style.setProperty('--selection-height', `0px`);
  };

  return null;
};

export default MouseTracker;
