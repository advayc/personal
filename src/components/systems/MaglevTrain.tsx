import { useEffect, useMemo, useRef, useState } from "react";
import { k, box, line, screw } from "./geometry";
import { useLive, useReducedMotion } from "./useLive";
type View = "three-quarter" | "side" | "front";
type System = "propulsion" | "levitation" | "guidance";
const notes: Record<System, string> = {
  propulsion:
    "Powered track coils make a traveling magnetic field that pulls and pushes the onboard magnets along.",
  levitation:
    "Passing magnets induce current in the paired track coils. Above roughly 150 km/h, the train rides about 10 cm clear.",
  guidance:
    "Shift the train sideways to see the nearer coils highlighted. Their magnetic forces restore it toward the center.",
};
function trainArt(view: View) {
  const p: k.Projection = {
    origin: [300, 300],
    scale: 1.24,
    azimuth: view === "side" ? 4 : view === "front" ? 86 : 38,
    elevation: view === "front" ? 18 : 28,
  };
  const ellipse = (x: number, y: number, z: number, rx: number, rz: number) =>
    k.pathOf(
      Array.from({ length: 40 }, (_, i) =>
        k.iso(
          [
            x + rx * Math.cos((i * Math.PI) / 20),
            y,
            z + rz * Math.sin((i * Math.PI) / 20),
          ],
          p,
        ),
      ),
      true,
    );
  let s = box(-160, -57, -13, 320, 114, 10, p);
  for (let x = -145; x <= 145; x += 29) {
    s += box(x, -53, -3, 8, 106, 3, p);
    for (const y of [-48, 48]) s += screw(x + 4, y, 0, p);
  }
  const coils = (y: number, near: boolean) => {
    let out = box(-160, y + (near ? 0 : -8), 0, 320, 8, near ? 4 : 42, p);
    for (let i = 0; i < 13; i++) {
      const x = -144 + i * 24;
      out += box(x - 9, y, 5, 18, 2, 32, p);
      out += `<g data-track-coil="${i}" data-side="${near ? "near" : "far"}"><path d="${ellipse(x, y + 2.2, 14, 7, 6) + ellipse(x, y + 2.2, 28, 7, 6)}" class="maglev-guide-coil"/><path d="${ellipse(x, y + 2.5, 21, 9, 15)}" class="maglev-drive-coil"/></g>`;
      for (const z of [7, 35])
        out += `<circle cx="${k.iso([x, y + 3, z], p)[0]}" cy="${k.iso([x, y + 3, z], p)[1]}" r=".8" class="bearing-ball"/>`;
    }
    out += box(-155, y - 1, 3, 310, 2, 2, p);
    return out;
  };
  s += coils(-47, false);
  let carriage = "";
  for (const x of [-77, 66]) {
    carriage += box(x - 23, -28, 9, 46, 56, 7, p);
    for (const y of [-28, 28]) {
      carriage += `<g data-train-wheel><path d="${ellipse(x, y, 7, 7, 7)}" class="train-wheel"/>`;
      const c = k.iso([x, y, 7], p);
      carriage += `<g transform="translate(${c[0]} ${c[1]})"><g data-wheel-spokes><path d="M-4 0H4M0 -4V4" class="gear-engraving"/></g></g></g>`;
      carriage += box(x - 22, y + (y > 0 ? 0 : -5), 15, 44, 5, 12, p, true);
      for (let j = 0; j < 4; j++)
        carriage += box(x - 19 + j * 10, y + (y > 0 ? 5 : -6), 17, 7, 1, 8, p);
      for (const xx of [x - 18, x + 18]) carriage += screw(xx, y, 27, p);
    }
  }
  carriage += box(-113, -27, 21, 222, 54, 4, p);
  for (let x = -92; x < 70; x += 20) {
    carriage += box(x, -18, 25, 12, 36, 2, p);
    for (const y of [-15, 8])
      carriage += box(x, y, 27, 11, 8, 3, p) + box(x - 1, y, 27, 3, 8, 10, p);
  }
  for (const x of [-35, -7, 21]) carriage += box(x, -20, 11, 20, 40, 8, p);
  let shell = k.solidSvg(
    k.extrude(
      [
        [-115, -27],
        [86, -27],
        [117, -14],
        [126, 0],
        [117, 14],
        [86, 27],
        [-115, 27],
      ],
      27,
      34,
      p,
    ),
    { tone: "mid" },
  );
  shell += box(-107, -24, 61, 190, 48, 3, p);
  shell += `<path d="${k.pathOf(
    [
      [89, -23, 55],
      [115, -12, 47],
      [115, 12, 47],
      [89, 23, 55],
    ].map((v) => k.iso(v as k.Point3, p)),
    true,
  )}" class="train-windscreen"/>`;
  for (let x = -94; x <= 65; x += 23)
    for (const y of [-27.5, 27]) shell += box(x, y, 40, 15, 1, 12, p, true);
  for (const x of [-70, -8, 53]) {
    shell += box(x, -17, 64, 29, 34, 1, p);
    for (let j = 0; j < 5; j++)
      shell += line(
        k.lineOnTop([x + 4 + j * 4, -13], [x + 4 + j * 4, 13], 65.1, p),
      );
    for (const y of [-14, 14]) shell += screw(x + 25, y, 65, p);
  }
  for (const x of [-106, 72])
    shell += line(
      k.onTop(
        [
          [x, -26],
          [x, -26],
          [x + 9, -26],
        ],
        62,
        p,
      ),
    );
  s += `<g data-train>${carriage}<g data-train-shell>${shell}</g></g>`;
  s += coils(45, true);
  return { svg: `<g class="mechanism-zoom">${s}</g>`, p };
}
export function MaglevTrain() {
  const [view, setView] = useState<View>("three-quarter"),
    [speed, setSpeed] = useState(200),
    [shell, setShell] = useState(65),
    [shift, setShift] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [system, setSystem] = useState<System>("levitation"),
    [running, setRunning] = useState(false);
  const reduced = useReducedMotion(),
    phase = useRef(0);
  const { svg, p } = useMemo(() => trainArt(view), [view]);
  const paint = (dt = 0) => {
    phase.current += dt * (0.7 + speed / 150);
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<SVGGElement>("[data-track-coil]").forEach((el) => {
      const i = Number(el.dataset.trackCoil),
        wave = (Math.sin(i * 0.65 - phase.current * 2 * Math.PI) + 1) / 2;
      const near = el.dataset.side === "near",
        offset = near ? shift : -shift;
      const strength =
        speed < 150 && system !== "propulsion"
          ? 0.1
          : system === "propulsion"
            ? wave
            : system === "guidance"
              ? (0.5 + offset / 15) * (0.75 + 0.25 * wave)
              : 0.3 + 0.7 * wave;
      el.style.setProperty(
        "--coil-strength",
        String(Math.max(0.12, Math.min(1, strength))),
      );
    });
    root
      .querySelectorAll("[data-wheel-spokes]")
      .forEach((el) =>
        el.setAttribute(
          "transform",
          `rotate(${speed < 150 ? phase.current * 180 : 0})`,
        ),
      );
  };
  const ref = useLive((_, dt) => paint(dt), running && speed > 0),
    paintRef = useRef(paint);
  paintRef.current = paint;
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const origin = k.iso([0, 0, 0], p),
      lift = k.iso([0, shift, speed >= 150 ? 13 : 0], p),
      top = k.iso([0, 0, shell * 0.8], p);
    root
      .querySelector("[data-train]")
      ?.setAttribute(
        "transform",
        `translate(${lift[0] - origin[0]} ${lift[1] - origin[1]})`,
      );
    root
      .querySelector("[data-train-shell]")
      ?.setAttribute(
        "transform",
        `translate(${top[0] - origin[0]} ${top[1] - origin[1]})`,
      );
    const wheel = k.iso([0, 0, speed >= 150 ? 5 : 0], p);
    root
      .querySelectorAll("[data-train-wheel]")
      .forEach((el) =>
        el.setAttribute(
          "transform",
          `translate(${wheel[0] - origin[0]} ${wheel[1] - origin[1]})`,
        ),
      );
    paintRef.current();
  }, [speed, shift, shell, p, system, ref]);
  return (
    <div
      className="system-instrument maglev-study"
      ref={ref}
      data-system={system}
      style={{ "--detail-zoom": zoom ? 1.4 : 1 } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 600 450"
        className="iso-svg"
        role="img"
        aria-label={`SCMaglev train ${view} cutaway, ${speed >= 150 ? "levitating" : "wheel supported"}, shell lifted ${shell} percent, ${system} coils highlighted`}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="instrument-controls">
        <div className="view-buttons" aria-label="Train view">
          {(["three-quarter", "side", "front"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v === "three-quarter" ? "¾ view" : v}
            </button>
          ))}
        </div>
        <button
          aria-pressed={running}
          disabled={reduced || speed === 0}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? "pause field" : "animate field"}
        </button>
        <button onClick={() => paint(0.15)}>step field</button>
        <button aria-pressed={zoom} onClick={() => setZoom((v) => !v)}>
          {zoom ? "fit view" : "closer look"}
        </button>
        <label>
          speed{" "}
          <input
            aria-label="Train speed in kilometers per hour"
            type="range"
            min={0}
            max={500}
            step={10}
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </label>
        <label>
          lift shell{" "}
          <input
            aria-label="Train shell separation"
            type="range"
            min={0}
            max={100}
            value={shell}
            onChange={(e) => setShell(+e.target.value)}
          />
        </label>
      </div>
      <output>
        {speed} km/h ·{" "}
        {speed >= 150 ? "levitating · ~10 cm clearance" : "on support wheels"} ·{" "}
        {system}
      </output>
      <div className="mechanism-inspector">
        <div className="view-buttons" aria-label="Inspect maglev system">
          {(["propulsion", "levitation", "guidance"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={system === v}
              onClick={() => setSystem(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <p>{notes[system]}</p>
        {system === "guidance" && (
          <div className="instrument-controls">
            <label>
              shift sideways{" "}
              <input
                aria-label="Train lateral displacement"
                type="range"
                min={-6}
                max={6}
                value={shift}
                onChange={(e) => setShift(+e.target.value)}
              />
            </label>
            <button onClick={() => setShift(0)}>center train</button>
          </div>
        )}
        <small>
          SCMaglev principle study · field animation slowed for visibility
        </small>
      </div>
    </div>
  );
}
