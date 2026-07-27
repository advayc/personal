import React, { useEffect, useState } from 'react';
import { FaHouse, FaXTwitter, FaLinkedin, FaGithub, FaFile, FaEnvelope, FaCode, FaCheck, FaSun, FaMoon } from 'react-icons/fa6';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setAccentColor?: (c: string) => void;
  setFontFamily?: (f: string) => void;
  setBgStyle?: (s: 'grid' | 'dots' | 'none') => void;
  setBgColor?: (c: string) => void;
  setTheme?: (t: 'light' | 'dark') => void;
  accentColor?: string;
  fontFamily?: string;
  bgStyle?: 'grid' | 'dots' | 'none';
  bgColor?: string;
  theme?: 'light' | 'dark';
}

interface ActionItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setAccentColor, setFontFamily, setBgStyle, setBgColor, setTheme, accentColor, fontFamily, bgStyle, bgColor, theme }) => {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [activeTab, setActiveTab] = useState<'nav' | 'settings'>('nav');
  const [shiftHeld, setShiftHeld] = useState(false);

  const actions: ActionItem[] = [
    { id: 'home', label: 'Go to Home', description: 'About me and what I\'m up to', shortcut: 'Shift+H', onSelect: () => { window.location.href = '/'; } },
    { id: 'x', label: 'X Profile', shortcut: 'Shift+X', onSelect: () => window.open('https://x.com/advay_c', '_blank') },
    { id: 'linkedin', label: 'LinkedIn Profile', shortcut: 'Shift+L', onSelect: () => window.open('https://www.linkedin.com/in/advay/', '_blank') },
    { id: 'github', label: 'GitHub Profile', shortcut: 'Shift+G', onSelect: () => window.open('https://github.com/advayc', '_blank') },
    { id: 'resume', label: 'Resume', shortcut: 'Shift+R', onSelect: () => window.open('/resume.pdf', '_blank') },
    { id: 'email', label: 'Email', shortcut: 'Shift+E', onSelect: () => window.open('mailto:advay.chandorkar@gmail.com', '_self') },
    { id: 'repo', label: 'Website Repository', shortcut: 'Shift+C', onSelect: () => window.open('https://github.com/advayc/personal', '_blank') }
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (activeTab === 'nav') {
        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        if (e.key === 'Enter') { e.preventDefault(); filtered[highlighted]?.onSelect(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, highlighted, filtered, activeTab, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleShortcut = (e: KeyboardEvent) => {
      const action = actions.find(a => a.shortcut?.toLowerCase() === `shift+${e.key.toLowerCase()}`);
      if (action && e.shiftKey) {
        e.preventDefault();
        action.onSelect();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen, actions]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-3 sm:p-4" onClick={onClose}>
  <div className="w-full max-w-[520px] max-h-[80vh] sm:max-h-[86vh] bg-[#121212]/95 border border-white/10 rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.65)] overflow-hidden ring-1 ring-white/5 flex flex-col" onClick={e => e.stopPropagation()} style={{ fontFamily }}>
        <div className="px-5 pt-4 pb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium text-lg flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/5 text-[var(--accent-color)] text-base">⌘</span>
              Command Center
            </div>
            <div className="flex gap-1 text-[11px] font-mono bg-white/5 rounded-md p-1">
              <button onClick={() => setActiveTab('nav')} className={`px-2 py-0.5 rounded-md transition ${activeTab==='nav'?'bg-[var(--accent-color)]/25 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Nav</button>
              <button onClick={() => setActiveTab('settings')} className={`px-2 py-0.5 rounded-md transition ${activeTab==='settings'?'bg-[var(--accent-color)]/25 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Settings</button>
            </div>
          </div>
          <div className="mt-3 mb-3 flex items-center bg-[#1e1e1e] rounded-md px-3 pr-2 ring-1 ring-white/5 focus-within:ring-[var(--accent-color)] transition h-10">
            <input
              autoFocus
              className="w-full bg-transparent py-1.5 text-sm text-white placeholder-white/30 outline-none"
              placeholder={activeTab==='nav'?"Search navigation...":"Search settings..."}
              value={query}
              onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">ESC</span>
          </div>
        </div>
        {activeTab==='nav' && (
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-white/40 flex items-center gap-2">
              <span className="h-px flex-1 bg-white/10" />
              <span>Navigation</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            {filtered.map((a, idx) => (
              <button
                key={a.id}
                onClick={a.onSelect}
                className={`group w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors ${idx === highlighted ? 'bg-white/10' : 'hover:bg-white/5'} text-white/90`}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight flex items-center gap-2 text-white">
                    {a.id==='home' && <FaHouse className="opacity-70" />}
                    {a.id==='x' && <FaXTwitter className="opacity-70" />}
                    {a.id==='linkedin' && <FaLinkedin className="opacity-70" />}
                    {a.id==='github' && <FaGithub className="opacity-70" />}
                    {a.id==='resume' && <FaFile className="opacity-70" />}
                    {a.id==='email' && <FaEnvelope className="opacity-70" />}
                    {a.id==='repo' && <FaCode className="opacity-70" />}
                    {a.label}
                  </span>
                  {a.description && <span className="text-white/45 text-[11px] mt-0.5 leading-snug pl-6">{a.description}</span>}
                </div>
                {a.shortcut && (
                  <div className="flex items-center gap-1 select-none">
                    {a.shortcut
                      .toLowerCase()
                      .split('+')
                      .filter(part => !(part.trim() === 'shift' && shiftHeld))
                      .map((part, idx, arr) => {
                        const isModifier = part.trim() === 'shift';
                        const capClasses = isModifier
                          ? 'px-2 py-1 rounded-lg'
                          : 'min-w-[28px] h-7 rounded-md flex items-center justify-center';
                        return (
                          <React.Fragment key={idx}>
                            <span className={`flex gap-1 text-[11px] font-mono bg-white/5 rounded-md p-1 ${capClasses}`}>
                              {isModifier ? part.trim() : part.trim().toUpperCase()}
                            </span>
                            {idx < arr.length - 1 && (
                              <span className="text-white/50 text-xs">+</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-white/30 text-xs">No results found</div>
            )}
          </div>
        )}
        {activeTab==='settings' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-6 px-5 text-xs text-white/80">
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Theme</h4>
              <div className="flex flex-wrap gap-2">
                {(['light','dark'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme && setTheme(t)}
                    className={`px-4 py-1.5 rounded-md border border-white/10 font-mono text-[10px] tracking-wide hover:bg-white/5 transition relative flex items-center gap-2 ${theme===t?'bg-[var(--accent-color)]/15 text-white border-[var(--accent-color)]/40':''}`}
                  >
                    {t==='dark' ? <FaMoon /> : <FaSun />}
                    <span className="capitalize">{t}</span>
                    {theme===t && <FaCheck className="absolute -top-2 -right-2 text-[9px] text-[var(--accent-color)] bg-black/60 rounded-full p-[2px]" />}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Accent Color</h4>
              <div className="flex flex-wrap gap-2 items-center">
                {['#22D3EE','#F472B6','#A78BFA','#34D399','#F59E0B','#F87171','#4ADE80','#38BDF8','#E879F9','#FB923C'].map(c => (
                  <button
                    key={c}
                    onClick={() => setAccentColor && setAccentColor(c)}
                    className={`w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition relative ${accentColor===c?'ring-2 ring-offset-1 ring-offset-[#121212] ring-white/70':''}`}
                    style={{ background: c }}
                    aria-label={`Set accent ${c}`}
                  >
                    {accentColor===c && <FaCheck className="absolute inset-0 m-auto text-white drop-shadow" />}
                  </button>
                ))}
                {/* Custom picker */}
                <div className="relative group">
                  <input
                    type="color"
                    className="opacity-0 absolute inset-0 cursor-pointer"
                    aria-label="Pick custom accent color"
                    onChange={e => setAccentColor && setAccentColor(e.target.value)}
                    value={accentColor}
                  />
                  <div className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-mono bg-[#1c1c1c] hover:bg-[#222] cursor-pointer">
                    +
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Background Color</h4>
              <div className="flex flex-wrap gap-2 items-center">
                {['#0a0a0a','#1b1917','#201c1c','#101010','#111827','#0f172a','#0b1020','#000000'].map(c => (
                  <button
                    key={c}
                    onClick={() => setBgColor && setBgColor(c)}
                    className={`w-7 h-7 rounded-lg border border-white/10 hover:scale-110 transition relative ${bgColor===c?'ring-2 ring-offset-1 ring-offset-[#121212] ring-white/70':''}`}
                    style={{ background: c }}
                    aria-label={`Set background ${c}`}
                    title={c}
                  >
                    {bgColor===c && <FaCheck className="absolute inset-0 m-auto text-white drop-shadow" />}
                  </button>
                ))}
                {/* Custom picker */}
                <div className="relative group">
                  <input
                    type="color"
                    className="opacity-0 absolute inset-0 cursor-pointer"
                    aria-label="Pick custom background color"
                    onChange={e => setBgColor && setBgColor(e.target.value)}
                    value={bgColor}
                  />
                  <div className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-mono bg-[#1c1c1c] hover:bg-[#222] cursor-pointer">
                    +
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Font Family</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {[
                  {label:'Inter', value:'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'},
                  {label:'JetBrains Mono', value:'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'},
                  {label:'SF Mono', value:'"SF Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'},
                  {label:'Consolas', value:'Consolas, ui-monospace, SFMono-Regular, Menlo, "Liberation Mono", monospace'},
                  {label:'Menlo', value:'Menlo, ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace'},
                  {label:'Roboto Mono', value:'"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'},
                  {label:'Courier New', value:'"Courier New", Courier, monospace'},
                  {label:'System UI', value:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'}
                ].map(f => (
                  <button
                    key={f.label}
                    onClick={() => setFontFamily && setFontFamily(f.value)}
                    style={{ fontFamily: f.value }}
                    className={`group relative px-2.5 py-1.5 rounded-md border border-white/10 text-left hover:bg-white/5 transition flex items-center justify-between ${fontFamily===f.value?'bg-[var(--accent-color)]/15 text-white border-[var(--accent-color)]/40':''}`}
                  >
                    <span className="text-[11px] tracking-tight">{f.label}</span>
                    {fontFamily===f.value && <FaCheck className="text-[var(--accent-color)]" />}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Background Style</h4>
              <div className="flex flex-wrap gap-3">
                {(['grid','dots','none'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setBgStyle && setBgStyle(s)}
                    className={`px-4 py-1.5 rounded-md border border-white/10 font-mono text-[10px] tracking-wide hover:bg-white/5 transition relative ${bgStyle===s?'bg-[var(--accent-color)]/15 text-white border-[var(--accent-color)]/40':''}`}
                  >
                    <span className="capitalize">{s}</span>
                    {bgStyle===s && <FaCheck className="absolute -top-2 -right-2 text-[9px] text-[var(--accent-color)] bg-black/60 rounded-full p-[2px]" />}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
  <div className="px-4 py-2 text-[9px] text-white/30 flex items-center justify-between border-t border-white/10 bg-[#101010]">
          <div className="space-x-1 hidden sm:block"><span>Enter ↵</span><span>↑↓</span></div>
          <div className="flex items-center gap-2 text-white/40"><span className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[8px]">ESC</span><span>close</span></div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
