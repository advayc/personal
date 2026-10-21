import { useEffect, useRef, useState } from "react";
export function useLive(
  draw: (seconds: number, dt: number) => void,
  enabled = true,
) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(draw);
  callback.current = draw;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0,
      visible = false,
      last = 0,
      time = 0;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const tick = (now: number) => {
      if (!visible || !enabled || reduced.matches) return;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      time += dt;
      callback.current(time, dt);
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (visible && enabled && !reduced.matches)
        raf = requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    obs.observe(el);
    reduced.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      reduced.removeEventListener("change", sync);
    };
  }, [enabled]);
  return ref;
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}
