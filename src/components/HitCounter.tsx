import React, { useEffect, useState } from 'react';

interface HitCounterProps {
  id: string;
  className?: string;
  initiallyFetchOnly?: boolean;
  variant?: 'default' | 'hero';
  fontFamily?: string;
  showLabel?: boolean;
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

const HitCounter: React.FC<HitCounterProps> = ({ id, className = '', initiallyFetchOnly = false, variant = 'default', fontFamily, showLabel = true }) => {
  const [hits, setHits] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const sessionKey = `hit-recorded-${id}`;

    const load = async () => {
      let value: number | null = null;

      if (process.env.NODE_ENV !== 'development' && !initiallyFetchOnly) {
        try {
          if (!sessionStorage.getItem(sessionKey)) {
            value = await resolveHits(id, true);
            if (value != null) sessionStorage.setItem(sessionKey, '1');
          }
        } catch { /* With blocked storage, only read the counter. */ }
      }

      if (value == null) {
        value = await resolveHits(id, false);
      }

      if (!cancelled) setHits(value);
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

  const count = hits === undefined ? '…' : hits === null ? '—' : hits.toLocaleString('en-US');
  const label = hits === undefined ? 'Loading view count' : hits === null ? 'View count unavailable' : `Recorded views: ${count}`;

  if (variant === 'hero') {
    return (
      <div
        className={`select-none cursor-pointer flex items-center justify-center gap-2 mt-0 mx-auto w-fit${className ? ` ${className}` : ''}`}
        aria-label={label}
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
          {count}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`select-none cursor-pointer inline-flex items-center gap-2 text-xs font-mono tracking-wide ${className}`}
      aria-label={label}
      style={fontFamily ? { fontFamily } : undefined}
    >
      {showLabel && <span className="opacity-70">views</span>}
      <span
        className="tabular-nums font-semibold transition duration-200 hover:underline"
        style={{
          color: 'var(--accent-color)',
          textDecorationColor: 'var(--accent-color)',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '3px',
        }}
      >
        {count}
      </span>
    </div>
  );
};

export default HitCounter;
