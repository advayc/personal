import { useMemo, useState } from "react";
import {
  P,
  k,
  board,
  box,
  disc,
  line,
  screw,
  chipArt,
  topMatrix,
} from "./geometry";
import { capacitance, capacitorCharge } from "./models";
export function Microcontroller() {
  const [value, setValue] = useState(1);
  const art = useMemo(() => chipArt(value), [value]);
  return (
    <div className="system-instrument">
      <svg
        viewBox="0 0 600 380"
        role="img"
        aria-label={`ATmega128 board with 64 pins and PORTB output ${value}`}
        className="iso-svg"
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls">
        <button onClick={() => setValue((v) => (v + 1) % 256)}>clock +1</button>
        <div className="bit-switches">
          {Array.from({ length: 8 }, (_, i) => 7 - i).map((i) => (
            <button
              key={i}
              aria-label={`Toggle bit ${i}`}
              aria-pressed={Boolean(value & (1 << i))}
              onClick={() => setValue((v) => v ^ (1 << i))}
            >
              {(value >> i) & 1}
            </button>
          ))}
        </div>
        <button onClick={() => setValue(0)}>reset</button>
      </div>
      <output>PORTB {value} · 8-bit AVR · 128 KB flash</output>
    </div>
  );
}
export function Capacitor() {
  const [gap, setGap] = useState(4);
  const [volts, setVolts] = useState(5);
  const c = capacitance(100, gap);
  const art = useMemo(() => {
    let s = board(210, 160);
    const z = 22 + gap * 6;
    s += box(-100, -14, 0, 17, 34, 18) + disc(-92, 3, 18, 5, 4, P, true);
    s += box(-68, -48, 15, 136, 96, 5);

    // Field lines terminate on the two inner plate faces, not in free space.
    for (let x = -48; x <= 48; x += 24)
      for (let y = -28; y <= 28; y += 28) {
        s += line(k.segment([x, y, 20], [x, y, z], P), volts > 0);
      }
    s += box(-68, -48, z, 136, 96, 5);
    for (const x of [-70, 70])
      for (const y of [-50, 50]) {
        s +=
          disc(x, y, 0, 5, 7) +
          disc(x, y, 7, 2, 84) +
          screw(x, y, 91) +
          disc(x, y, z - 2, 4, 9);
      }
    s += `<g transform="${topMatrix(z + 5.2)}">`;
    for (let x = -48; x <= 48; x += 24)
      for (let y = -28; y <= 28; y += 28)
        s += `<path d="M${x - 2} ${y}h4 M${x} ${y - 2}v4" class="charge-mark" opacity="${volts / 10}"/>`;
    s += "</g>";
    return s;
  }, [gap, volts]);
  return (
    <div className="system-instrument">
      <svg
        viewBox="0 0 600 380"
        className="iso-svg"
        role="img"
        aria-label="Adjustable parallel-plate capacitor with field lines between plates"
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls">
        <label>
          gap{" "}
          <input
            aria-label="Plate gap in millimeters"
            type="range"
            min={1}
            max={8}
            step={0.5}
            value={gap}
            onChange={(e) => setGap(+e.target.value)}
          />
        </label>
        <label>
          voltage{" "}
          <input
            aria-label="Capacitor voltage"
            type="range"
            min={0}
            max={10}
            value={volts}
            onChange={(e) => setVolts(+e.target.value)}
          />
        </label>
      </div>
      <output>
        {gap.toFixed(1)} mm · {volts} V · {(c * 1e12).toFixed(1)} pF · Q ={" "}
        {(capacitorCharge(volts, c) * 1e12).toFixed(0)} pC
      </output>
    </div>
  );
}
