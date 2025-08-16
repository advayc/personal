import React, { useEffect, useState } from 'react';
import { FaHouse, FaXTwitter, FaLinkedin, FaGithub, FaFile, FaEnvelope, FaCode, FaCheck } from 'react-icons/fa6';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setAccentColor?: (c: string) => void;
  setFontFamily?: (f: string) => void;
  setBgStyle?: (s: 'grid' | 'dots') => void;
  accentColor?: string;
  fontFamily?: string;
  bgStyle?: 'grid' | 'dots';
}

interface ActionItem {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setAccentColor, setFontFamily, setBgStyle, accentColor, fontFamily, bgStyle }) => {
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const [activeTab, setActiveTab] = useState<'nav' | 'settings'>('nav');

  const actions: ActionItem[] = [
    { id: 'home', label: 'Go to Home', description: 'About me and what I\'m up to', shortcut: 'H', onSelect: () => { window.location.href = '/'; } },
    { id: 'x', label: 'X Profile', shortcut: 'X', onSelect: () => window.open('https://x.com/advay_0', '_blank') },
    { id: 'linkedin', label: 'LinkedIn Profile', shortcut: 'L', onSelect: () => window.open('https://www.linkedin.com/in/advay/', '_blank') },
    { id: 'github', label: 'GitHub Profile', shortcut: 'G', onSelect: () => window.open('https://github.com/advayc', '_blank') },
    { id: 'resume', label: 'Resume', shortcut: 'R', onSelect: () => window.open('/resume.pdf', '_blank') },
    { id: 'email', label: 'Email', shortcut: 'E', onSelect: () => window.open('mailto:advay.chandorkar@gmail.com', '_self') },
    { id: 'repo', label: 'Website Repository', shortcut: 'C', onSelect: () => window.open('https://github.com/advayc/personal', '_blank') }
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
      const action = actions.find(a => a.shortcut?.toLowerCase() === e.key.toLowerCase());
      if (action) {
        e.preventDefault();
        action.onSelect();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen, actions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
  <div className="w-full max-w-[760px] bg-[#121212]/95 border border-white/10 rounded-2xl shadow-[0_16px_56px_-12px_rgba(0,0,0,0.7)] overflow-hidden ring-1 ring-white/5" onClick={e => e.stopPropagation()} style={{ fontFamily }}>
        <div className="px-5 pt-4 pb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium text-xl flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-white/5 text-[var(--accent-color)] text-lg">⌘</span>
              Command Center
            </div>
            <div className="flex gap-2 text-xs font-mono bg-white/5 rounded-md p-1">
              <button onClick={() => setActiveTab('nav')} className={`px-2 py-1 rounded-md transition ${activeTab==='nav'?'bg-[var(--accent-color)]/25 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Nav</button>
              <button onClick={() => setActiveTab('settings')} className={`px-2 py-1 rounded-md transition ${activeTab==='settings'?'bg-[var(--accent-color)]/25 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Settings</button>
            </div>
          </div>
          <div className="mt-4 mb-4 flex items-center bg-[#1e1e1e] rounded-md px-4 pr-3 ring-1 ring-white/5 focus-within:ring-[var(--accent-color)] transition h-12">
            <input
              autoFocus
              className="w-full bg-transparent py-2 text-base text-white placeholder-white/30 outline-none"
              placeholder={activeTab==='nav'?"Search navigation...":"Search settings..."}
              value={query}
              onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">ESC</span>
          </div>
        </div>
        {activeTab==='nav' && (
          <div className="max-h-[480px] overflow-y-auto py-3">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-white/40 flex items-center gap-2">
              <span className="h-px flex-1 bg-white/10" />
              <span>Navigation</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            {filtered.map((a, idx) => (
              <button
                key={a.id}
                onClick={a.onSelect}
                className={`group w-full flex items-center justify-between px-5 py-4 text-left text-base transition-colors ${idx === highlighted ? 'bg-white/10' : 'hover:bg-white/5'} text-white/90`}
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
                  {a.description && <span className="text-white/45 text-[12px] mt-0.5 leading-snug pl-7">{a.description}</span>}
                </div>
                {a.shortcut && (
                  <span className="text-[11px] font-mono px-2 py-1 rounded bg-white/5 text-white/60 border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">{a.shortcut}</span>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-white/30 text-sm">No results found</div>
            )}
          </div>
        )}
        {activeTab==='settings' && (
          <div className="max-h-[460px] overflow-y-auto py-5 space-y-8 px-6 text-sm text-white/80">
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Accent Color</h4>
              <div className="flex flex-wrap gap-2 items-center">
                {['#22D3EE','#F472B6','#A78BFA','#34D399','#F59E0B','#F87171','#4ADE80','#38BDF8','#E879F9','#FB923C'].map(c => (
                  <button
                    key={c}
                    onClick={() => setAccentColor && setAccentColor(c)}
                    className={`w-8 h-8 rounded-lg border border-white/10 hover:scale-110 transition relative ${accentColor===c?'ring-2 ring-offset-2 ring-offset-[#121212] ring-white/70':''}`}
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
                  <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-[10px] font-mono bg-[#1c1c1c] hover:bg-[#222] cursor-pointer">
                    +
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Font Family</h4>
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
                    className={`group relative px-3 py-2 rounded-md border border-white/10 text-left hover:bg-white/5 transition flex items-center justify-between ${fontFamily===f.value?'bg-[var(--accent-color)]/15 text-white border-[var(--accent-color)]/40':''}`}
                  >
                    <span className="text-sm tracking-tight">{f.label}</span>
                    {fontFamily===f.value && <FaCheck className="text-[var(--accent-color)]" />}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h4 className="text-[11px] uppercase tracking-wider text-white/40 mb-3">Background Style</h4>
              <div className="flex flex-wrap gap-3">
                {(['grid','dots'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setBgStyle && setBgStyle(s)}
                    className={`px-5 py-2 rounded-md border border-white/10 font-mono text-xs tracking-wide hover:bg-white/5 transition relative ${bgStyle===s?'bg-[var(--accent-color)]/15 text-white border-[var(--accent-color)]/40':''}`}
                  >
                    <span className="capitalize">{s}</span>
                    {bgStyle===s && <FaCheck className="absolute -top-2 -right-2 text-[10px] text-[var(--accent-color)] bg-black/60 rounded-full p-[2px]" />}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
        <div className="px-5 py-3 text-[10px] text-white/30 flex items-center justify-between border-t border-white/10 bg-[#101010]">
          <div className="space-x-2 hidden sm:block"><span>Enter ↵</span><span>navigate ↑↓</span></div>
          <div className="flex items-center gap-2 text-white/40"><span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px]">ESC</span><span>close</span></div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
