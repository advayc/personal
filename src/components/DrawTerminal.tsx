import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useDragControls } from 'framer-motion';
import Draw from './Draw';
import { useTerminal } from './TerminalContext';

const COLOR_PALETTE = ['#ffffff', '#000000', '#ff4757', '#ffa502', '#ffdd59', '#2ed573', '#1e90ff', '#3742fa', '#a55eea', '#ff6b81', '#70a1ff', '#2f3542'];
const BG_PRESETS = ['#111111', '#151515', '#1e1e1e', '#222831', '#2d3436', '#000000', '#fafafa'];

const DrawTerminal: React.FC<{ onClose: () => void; headerText: string; }> = ({ onClose, headerText }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTool, setActiveTool] = useState<'brush' | 'fill' | 'eraser' | 'highlight' | 'text'>('brush');
  const [mode, setMode] = useState<'draw' | 'whiteboard'>('draw');
  const [activeColor, setActiveColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#151515');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [customBg, setCustomBg] = useState('#151515');
  const [brushSize, setBrushSize] = useState(2); // default smaller brush per request
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const { setIsTerminalOpen } = useTerminal();
  const dragControls = useDragControls();

  // Larger default drawing surface inside terminal; terminal container will size around this
  const width = isMaximized ? 1150 : 870; // increased width by 50
  const height = isMaximized ? 560 : 460; // lowered height by additional 40

  const pushHistory = useCallback(() => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const next = [...trimmed, snapshot].slice(-25);
        setHistoryIndex(next.length - 1);
        return next;
      });
    } catch {}
  }, [historyIndex]);

  const restoreHistory = (idx: number) => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const frame = history[idx];
    if (frame) ctx.putImageData(frame, 0, 0);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    restoreHistory(newIndex);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    restoreHistory(newIndex);
  };

  const saveImage = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const cycleBackground = () => {
    setBackgroundColor(prev => {
      const idx = BG_PRESETS.indexOf(prev);
      return BG_PRESETS[(idx + 1) % BG_PRESETS.length];
    });
  };

  useEffect(() => {
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    if (accent) {
      setActiveColor(accent);
      setCustomColor(accent);
    }
  }, []);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.shiftKey && key === 's') { e.preventDefault(); saveImage(); }
      if (e.shiftKey && key === 'b') { e.preventDefault(); cycleBackground(); }
      if (e.shiftKey && key === 'f') { e.preventDefault(); setActiveTool('fill'); }
      if (e.shiftKey && key === 'e') { e.preventDefault(); setActiveTool('eraser'); }
      if (e.shiftKey && key === 'w') { e.preventDefault(); toggleMode(); }
      if (e.metaKey && key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.metaKey && key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
      if (e.key === 'Escape') { handleClose(); }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [undo, redo, mode]);

  // Toggle between draw and whiteboard mode
  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next = prev === 'draw' ? 'whiteboard' : 'draw';
      if (next === 'whiteboard') {
        // Whiteboard: white background, dark stroke default
        setBackgroundColor('#ffffff');
        setCustomBg('#ffffff');
        setActiveColor('#111111');
        setCustomColor('#111111');
      } else {
        // Return to draw mode: revert to accent color & dark bg if currently white
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#ffffff';
        setBackgroundColor('#151515');
        setCustomBg('#151515');
        setActiveColor(accent);
        setCustomColor(accent);
      }
      return next;
    });
  }, []);

  const clearCanvas = () => {
    const canvas = canvasWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    pushHistory();
    ctx.clearRect(0,0,canvas.width, canvas.height);
  };

  const handleClose = () => { onClose(); setIsTerminalOpen(false); };

  const handleContainerPointerDown = (e: React.PointerEvent) => {
    const header = (e.target as HTMLElement).closest('.draw-header');
    if (header) {
      dragControls.start(e);
    }
  };

  return (
    <motion.div
      className={`terminal-container transition-all duration-300 ease-out ${isMinimized? 'hidden': ''} fixed z-50 font-mono text-sm border border-gray-800/50 bg-[#151515]/95 rounded-lg shadow-lg shadow-black/40`}
  style={{ width: width + 40, height: height + 140, top: 40, left: 96, touchAction: 'none' }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      data-draw-instance
      drag={false}
      dragControls={dragControls}
      dragListener={false}
      onPointerDown={handleContainerPointerDown}
    >
      <div className="draw-header flex items-center justify-between bg-white text-white px-4 py-2 cursor-move select-none rounded-t">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-[#FB5F57] rounded-full hover:bg-red-600 cursor-pointer" onClick={handleClose} />
          <div className="w-3 h-3 bg-[#FBBD2E] rounded-full hover:bg-amber-600 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)} />
          <div className="w-3 h-3 bg-gprimary rounded-full hover:bg-green-600 cursor-pointer" onClick={() => setIsMaximized(!isMaximized)} />
        </div>
        <div className="flex-grow text-center flex items-center justify-center text-xs tracking-wide text-black ">
          <span className="font-medium">advaychandorkar@personalsite: ~/personal/{mode === 'whiteboard' ? 'whiteboard' : 'draw'} mode</span>
        </div>
      </div>
      <div className="flex flex-col bg-[#0e0e0e] h-full">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-white/5 bg-[#141414] select-none">
          <button onClick={toggleMode} className={`px-2 py-1 rounded text-xs font-semibold transition ${mode==='whiteboard'? 'bg-white text-black':'bg-[var(--accent-color)] text-black'}`} title="Shift+W toggle mode">{mode==='whiteboard'?'Whiteboard':'Draw'}</button>
          <div className="flex items-center gap-1">
            {((mode==='whiteboard'? ['brush','highlight','text','eraser'] : ['brush','fill','eraser']) as typeof activeTool[]).map(tool => (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className={`px-2 py-1 rounded text-xs font-semibold transition ${activeTool===tool? 'bg-[var(--accent-color)] text-black':'bg-zinc-800/80 text-white/80 hover:bg-zinc-700'}`}
              >{tool}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {COLOR_PALETTE.map(c => (
              <button key={c} onClick={() => { setActiveColor(c); setCustomColor(c); }}
                style={{ background: c }}
                className={`w-5 h-5 rounded border ${activeColor===c? 'border-white shadow':'border-black/40'}`}
              />
            ))}
            <label className="w-6 h-6 rounded overflow-hidden border border-white/20 flex items-center justify-center bg-zinc-800 cursor-pointer" title="Custom color">
              <input
                type="color"
                aria-label="Custom brush color"
                value={customColor}
                onChange={(e) => { setCustomColor(e.target.value); setActiveColor(e.target.value); }}
                className="opacity-0 absolute w-0 h-0"
              />
              <span className="w-4 h-4 rounded" style={{ background: customColor }} />
            </label>
          </div>
          <div className="flex items-center ml-4 gap-2">
            <label className="text-xs text-white/60">size</label>
            <input
              type="range"
              min={1}
              max={48}
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="cursor-pointer"
              aria-label="Brush size"
              title="Brush size"
            />
            <span className="text-xs text-white/70 w-6">{brushSize}</span>
          </div>
          {mode==='draw' && (
            <div className="flex items-center ml-4 gap-2">
              <label className="text-xs text-white/60">bg</label>
              <select
                value={backgroundColor}
                onChange={e => { setBackgroundColor(e.target.value); setCustomBg(e.target.value); }}
                className="bg-zinc-800 text-white text-xs rounded px-1 py-1"
                aria-label="Background color"
                title="Background color"
              >
                {BG_PRESETS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              <button onClick={cycleBackground} className="text-[10px] px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-white/80">cycle</button>
              <label className="w-6 h-6 rounded overflow-hidden border border-white/20 flex items-center justify-center bg-zinc-800 cursor-pointer" title="Custom background color">
                <input
                  type="color"
                  aria-label="Custom background color"
                  value={customBg}
                  onChange={(e) => { setCustomBg(e.target.value); setBackgroundColor(e.target.value); }}
                  className="opacity-0 absolute w-0 h-0"
                />
                <span className="w-4 h-4 rounded" style={{ background: customBg }} />
              </label>
            </div>
          )}
          <div className="flex items-center ml-auto gap-2">
            <button onClick={undo} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700">undo</button>
            <button onClick={redo} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700">redo</button>
            <button onClick={clearCanvas} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700">clear</button>
            <button onClick={saveImage} className="px-3 py-1 text-xs rounded bg-[var(--accent-color)] text-black font-semibold shadow hover:brightness-110">save</button>
          </div>
        </div>
  <div ref={canvasWrapperRef} className="flex-1 flex items-center justify-center p-6 select-none" onPointerDown={(e) => { if (e.target instanceof HTMLDivElement) e.stopPropagation(); }}>
          <Draw
            width={width}
            height={height}
            backgroundColor={backgroundColor}
            activeTool={activeTool}
            activeColor={activeColor}
            brushSize={brushSize}
            onChange={() => {}}
            pushHistory={pushHistory}
            canDraw={!isMinimized}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DrawTerminal;
