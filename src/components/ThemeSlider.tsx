import { useId, type CSSProperties } from "react";
export const themes = ["black", "gray", "cream", "white"] as const;
export type Background = (typeof themes)[number];
export default function ThemeSlider({
  value,
  onChange,
}: {
  value: Background;
  onChange: (value: Background) => void;
}) {
  const id = useId();
  return (
    <div
      className="theme-slider"
      style={{ "--theme-step": themes.indexOf(value) } as CSSProperties}
    >
      <div className="theme-slider-label">
        <label htmlFor={id}>appearance</label>
        <span aria-hidden="true">{value}</span>
      </div>
      <div className="theme-slider-track">
        <span className="theme-slider-dots" aria-hidden="true">
          {themes.map((theme) => (
            <i key={theme} className={`theme-dot theme-dot-${theme}`} />
          ))}
        </span>
        <span className="theme-slider-rail" aria-hidden="true">
          <span
            className="theme-slider-thumb"
            style={{ left: `${(themes.indexOf(value) * 100) / 3}%` }}
          />
        </span>
        <input
          id={id}
          aria-label="Background appearance"
          aria-valuetext={value}
          type="range"
          min={0}
          max={3}
          step={1}
          value={themes.indexOf(value)}
          onChange={(event) => onChange(themes[Number(event.target.value)])}
        />
      </div>
    </div>
  );
}
