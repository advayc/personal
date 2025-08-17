import React, { useEffect, useRef, useState } from 'react';

interface HitCounterProps {
  id: string;
  className?: string;
  initiallyFetchOnly?: boolean;
  variant?: 'default' | 'hero';
  fontFamily?: string;
}

const useAnimatedNumber = (target: number | null, duration = 800) => {
  const [display, setDisplay] = useState(0);
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (target == null) return;
    const start = prevTargetRef.current == null ? 0 : prevTargetRef.current;
    const end = target;
    if (start === end) return;
    prevTargetRef.current = end;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const value = Math.round(start + (end - start) * progress);
      setDisplay(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return target == null ? null : display;
};

const HitCounter: React.FC<HitCounterProps> = ({ id, className = '', initiallyFetchOnly = false, variant = 'default', fontFamily }) => {
  const [hits, setHits] = useState<number | null>(null);
  const incrementedRef = useRef(false);

  useEffect(() => {
    if (incrementedRef.current) return;
    incrementedRef.current = true;
    const method = initiallyFetchOnly ? 'GET' : 'POST';
    (async () => {
      try {
        const res = await fetch(`/api/hit?id=${encodeURIComponent(id)}`, { method, cache: 'no-store' });
        const json = await res.json();
        if (res.ok && typeof json.hits === 'number') {
          setHits(json.hits);
        } else {
          console.error('Hit counter error', json);
        }
      } catch (e) {
        console.error('Failed to load hits', e);
      }
    })();
  }, [id, initiallyFetchOnly]);

  const animated = useAnimatedNumber(hits);

  if (variant === 'hero') {
    return (
      <div
        className={`select-none flex items-center justify-center gap-1 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md shadow-xl border border-white/10 mt-0 mx-auto w-fit` + (className ? ` ${className}` : '')}
        aria-label={hits == null ? 'Loading view count' : `Page viewed ${hits} times`}
        style={fontFamily ? { fontFamily } : undefined}
      >
        <span className="text-primary font-extrabold text-base sm:text-base tracking-widest" style={{letterSpacing: '0.08em'}}>views:</span>
        <span className="font-extrabold text-base sm:text-base tabular-nums" style={{color: 'var(--accent-color)', letterSpacing: '0.08em'}}>{animated == null ? '…' : animated}</span>
      </div>
    );
  }
  return (
    <div
      className={`select-none inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono tracking-wide shadow-sm backdrop-blur-sm border-[var(--accent-color)]/40 bg-[rgba(var(--accent-color-rgb),0.08)] text-[var(--accent-color)] ${className}`}
      aria-label={hits == null ? 'Loading view count' : `Page viewed ${hits} times`}
      style={fontFamily ? { fontFamily } : undefined}
    >
      <span className="opacity-70">views</span>
      <span className="tabular-nums font-semibold text-primary">{animated == null ? '…' : animated}</span>
    </div>
  );
};

export default HitCounter;
