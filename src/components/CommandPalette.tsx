import React, { useEffect, useState } from 'react';
import Link from '@/components/Link';

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
      if (e.key === 'Enter') { e.preventDefault(); filtered[highlighted]?.onSelect(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, highlighted]);

  const actions: ActionItem[] = [
    {
      id: 'home',
      label: 'Go to Home',
      description: 'About me and what I\'m up to',
      shortcut: 'H',
      onSelect: () => { window.location.href = '/'; }
    },
    {
      id: 'x',
      label: 'X Profile',
      shortcut: 'X',
      onSelect: () => window.open('https://x.com/advayc_', '_blank')
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Profile',
      shortcut: 'L',
      onSelect: () => window.open('https://www.linkedin.com/in/advay/', '_blank')
    },
    {
      id: 'github',
      label: 'GitHub Profile',
      shortcut: 'G',
      onSelect: () => window.open('https://github.com/advayc', '_blank')
    },
    {
      id: 'resume',
      label: 'Resume',
      shortcut: 'R',
      onSelect: () => window.open('/resume.pdf', '_blank')
    },
    {
      id: 'email',
      label: 'Email',
      shortcut: 'E',
      onSelect: () => window.open('mailto:advay.chandorkar@gmail.com', '_self')
    },
    {
      id: 'repo',
      label: 'Website Repository',
      shortcut: 'C',
      onSelect: () => window.open('https://github.com/advayc/personal', '_blank')
    }
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm p-4 sm:p-0" onClick={onClose}>
      <div className="w-full max-w-[680px] bg-[#121212] border border-white/10 rounded-2xl shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 pt-4 pb-0 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium text-lg flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/5 text-[var(--accent-color)]">⌘</span>
              Command Center
            </div>
            <div className="flex gap-2 text-xs font-mono bg-white/5 rounded-md p-1">
              <button onClick={() => setActiveTab('nav')} className={`px-2 py-1 rounded-md transition ${activeTab==='nav'?'bg-[var(--accent-color)]/20 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Nav</button>
              <button onClick={() => setActiveTab('settings')} className={`px-2 py-1 rounded-md transition ${activeTab==='settings'?'bg-[var(--accent-color)]/20 text-white':'text-white/50 hover:text-white hover:bg-white/10'}`}>Settings</button>
            </div>
          </div>
          <div className="mt-2 mb-3 flex items-center bg-[#1e1e1e] rounded-md px-3 pr-2 ring-1 ring-white/5 focus-within:ring-[var(--accent-color)] transition">
            <input
              autoFocus
              className="w-full bg-transparent py-2 text-sm text-white placeholder-white/30 outline-none"
              placeholder={activeTab==='nav'?"Search navigation...":"Search settings..."}
              value={query}
              onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
            />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">ESC</span>
          </div>
        </div>
        {activeTab==='nav' && (
          <div className="max-h-[420px] overflow-y-auto py-2">
            <div className="px-4 py-1 text-[10px] uppercase tracking-wider font-semibold text-white/40">Navigation</div>
            {filtered.map((a, idx) => (
              <button
                key={a.id}
                onClick={a.onSelect}
                className={`group w-full flex items-center justify-between px-4 py-3 text-left text-sm transition-colors ${idx === highlighted ? 'bg-white/10' : 'hover:bg-white/5'} text-white/90`}
                onMouseEnter={() => setHighlighted(idx)}
              >
                <div className="flex flex-col">
                  <span className="font-medium tracking-tight">{a.label}</span>
                  {a.description && <span className="text-white/40 text-[11px] mt-0.5 leading-snug">{a.description}</span>}
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
          <div className="max-h-[420px] overflow-y-auto py-4 space-y-6 px-5 text-sm text-white/80">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Accent Color</h4>
              <div className="flex flex-wrap gap-2">
                {['#22D3EE','#F472B6','#A78BFA','#34D399','#F59E0B','#F87171','#4ADE80','#38BDF8'].map(c => (
                  <button key={c} onClick={() => setAccentColor && setAccentColor(c)} className="w-7 h-7 rounded-md border border-white/10 hover:scale-110 transition" style={{background:c, boxShadow: accentColor===c? '0 0 0 2px #fff inset':''}} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Font</h4>
              <div className="grid grid-cols-2 gap-2">
                {['ui-monospace','"SF Mono"','Consolas','Menlo','monospace'].map(f => (
                  <button key={f} onClick={() => setFontFamily && setFontFamily(f)} style={{fontFamily:f}} className={`px-3 py-2 rounded-md border border-white/10 text-left hover:bg-white/5 transition ${fontFamily===f?'bg-[var(--accent-color)]/20 text-white':''}`}>{f.replace(/"/g,'')}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-white/40 mb-2">Background Style</h4>
              <div className="flex gap-3">
                {(['grid','dots'] as const).map(s => (
                  <button key={s} onClick={() => setBgStyle && setBgStyle(s)} className={`px-4 py-2 rounded-md border border-white/10 font-mono text-xs tracking-wide hover:bg-white/5 transition ${bgStyle===s?'bg-[var(--accent-color)]/20 text-white':''}`}>{s}</button>
                ))}
              </div>
            </div>
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
