import React, { useEffect, useRef, useState } from 'react';

interface HitCounterProps {
  id: string;
  className?: string;
  initiallyFetchOnly?: boolean;
  variant?: 'default' | 'hero';
  fontFamily?: string;
}

const inflight = new Map<string, Promise<number | null>>();

async function resolveHits(id: string, increment: boolean): Promise<number | null> {
  const cacheKey = `${id}:${increment ? 'hit' : 'count'}`;
  const existing = inflight.get(cacheKey);
  if (existing) return existing;

  const request = (async () => {
    try {
      const endpoint = increment ? `/api/hit?id=${encodeURIComponent(id)}` : `/api/count?id=${encodeURIComponent(id)}`;
      const res = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return typeof json.hits === 'number' ? json.hits : null;
    } catch {
      return null;
    } finally {
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, request);
  return request;
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

  return target == null ? null : display.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const HitCounter: React.FC<HitCounterProps> = ({ id, className = '', initiallyFetchOnly = false, variant = 'default', fontFamily }) => {
  const [hits, setHits] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionKey = `hit-recorded-${id}`;

    const load = async () => {
      let value: number | null = null;

      if (!initiallyFetchOnly && !sessionStorage.getItem(sessionKey)) {
        value = await resolveHits(id, true);
        if (value != null) sessionStorage.setItem(sessionKey, '1');
      }

      if (value == null) {
        value = await resolveHits(id, false);
      }

      if (!cancelled && value != null) setHits(value);
    };

    const schedule = () => { if (!cancelled) void load(); };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(schedule, { timeout: 2000 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = setTimeout(schedule, 100);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [id, initiallyFetchOnly]);

  const animated = useAnimatedNumber(hits);

  if (variant === 'hero') {
    return (
      <div
        className={`select-none flex items-center justify-center gap-2 mt-0 mx-auto w-fit${className ? ` ${className}` : ''}`}
        aria-label={hits == null ? 'Loading view count' : `Page viewed ${hits} times`}
        style={fontFamily ? { fontFamily } : undefined}
      >
        <span className="text-primary text-base sm:text-base">views —</span>
        <span
          className="font-bold text-base sm:text-base tabular-nums transition duration-200 hover:underline"
          style={{
            color: 'var(--accent-color)',
            textDecorationColor: 'var(--accent-color)',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: '3px',
          }}
        >
          {animated == null ? '…' : animated}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`select-none inline-flex items-center gap-2 text-xs font-mono tracking-wide ${className}`}
      aria-label={hits == null ? 'Loading view count' : `Page viewed ${hits} times`}
      style={fontFamily ? { fontFamily } : undefined}
    >
      <span className="opacity-70">views</span>
      <span
        className="tabular-nums font-semibold transition duration-200 hover:underline"
        style={{
          color: 'var(--accent-color)',
          textDecorationColor: 'var(--accent-color)',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
        }}
      >
        {animated == null ? '…' : animated}
      </span>
    </div>
  );
};

export default HitCounter;
