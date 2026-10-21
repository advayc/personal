import { useEffect, useRef, useState } from "react";
import { gearPath } from "./geometry";
import { planetarySpeeds, type GearLock } from "./models";
import { useLive, useReducedMotion } from "./useLive";
const bearing = (r: number, n = 12) =>
  `<circle r="${r}" class="movement-hub"/><circle r="${r - 3}" class="movement-well"/>${Array.from({ length: n }, (_, i) => `<circle cx="${Math.cos((i * 2 * Math.PI) / n) * (r - 1.5)}" cy="${Math.sin((i * 2 * Math.PI) / n) * (r - 1.5)}" r=".7" class="bearing-ball"/>`).join("")}`;
function wheel(r: number, n: number) {
  return `<path d="${gearPath(n, r)}" transform="translate(0 1.5)" class="gear-thickness"/><path d="${gearPath(n, r)}" class="precision-gear"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${Math.cos((i * Math.PI) / 3) * (r * 0.62)}" cy="${Math.sin((i * Math.PI) / 3) * (r * 0.62)}" r="${r * 0.13}" class="movement-well"/>`).join("")}${bearing(6, 8)}<path d="M-2 0h4" class="gear-engraving"/>`;
}
function GearArt() {
  let s = `<g transform="translate(300 202)"><rect x="-145" y="-139" width="290" height="278" rx="18" class="gearbox-base"/><rect x="-132" y="-126" width="264" height="252" rx="14" class="gearbox-recess"/>`;
  s += `<circle r="111" class="gearbox-housing"/><circle r="104" class="gearbox-shoulder"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * 123;
    const y = Math.sin(a) * 123;
    s += `<circle cx="${x}" cy="${y}" r="5.4" class="gearbox-fastener-seat"/><path d="M${x - 2.1} ${y}h4.2M${x} ${y - 2.1}v4.2" class="gear-engraving"/>`;
  }
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24;
    const x = Math.cos(a) * 106;
    const y = Math.sin(a) * 106;
    s += `<circle cx="${x}" cy="${y}" r="1.15" class="gearbox-bearing-ball"/>`;
  }
  const planetRadius = 49;
  s += `<g data-part="carrier"><g data-carrier><path d="M-10 -4L-${planetRadius - 7} -4A7 7 0 0 0 -${planetRadius - 7} 4L-10 4Z M10 -4L${planetRadius - 7} -4A7 7 0 0 1 ${planetRadius - 7} 4L10 4Z M-4 -10V-${planetRadius - 7}A7 7 0 0 1 4 -${planetRadius - 7}V-10Z" class="gear-carrier-arm"/><path d="M-4 10V${planetRadius - 7}A7 7 0 0 0 4 ${planetRadius - 7}V10Z" class="gear-carrier-arm"/>${[0, 120, 240].map((a) => `<g transform="rotate(${a})"><circle cy="${planetRadius}" r="7.5" class="gear-carrier-pin"/><circle cy="${planetRadius}" r="3.1" class="gearbox-bearing-inner"/></g>`).join("")}<circle r="12" class="gear-carrier-hub"/><circle r="5" class="gearbox-bearing-inner"/></g></g>`;
  s += `<g data-part="ring"><g data-ring><path d="M98 0A98 98 0 1 1 -98 0A98 98 0 1 1 98 0Z ${gearPath(54, 75)}" fill-rule="evenodd" class="precision-gear gearbox-ring"/>${Array.from({ length: 24 }, (_, i) => { const a = (i * Math.PI) / 12; return `<circle cx="${Math.cos(a) * 89}" cy="${Math.sin(a) * 89}" r="1.6" class="gearbox-relief"/>`; }).join("")}<circle r="93" class="gearbox-ring-edge"/></g></g>`;
  s += `<g data-part="sun"><g data-sun>${wheel(24.5, 18)}</g></g>`;
  s += `<g data-part="planets"><g data-planets>${[0, 120, 240].map((a) => `<g transform="rotate(${a}) translate(0 ${planetRadius})"><g data-planet>${wheel(24.5, 18)}</g></g>`).join("")}</g></g>`;
  // The removable top bearing plate slides aside in the plan view to expose the gear mesh.
  s += `<g data-bearing-cover><path d="M103 0A103 103 0 1 1 -103 0A103 103 0 1 1 103 0Z M98 0A98 98 0 1 0 -98 0A98 98 0 1 0 98 0Z" fill-rule="evenodd" class="movement-bridge gearbox-cover-ring"/>${[0, 120, 240].map((a) => `<g transform="rotate(${a})"><path d="M-5 7L-4 93H4L5 7Z" class="movement-bridge gearbox-cover-spoke"/><circle cy="90" r="4" class="gearbox-cover-rivet"/></g>`).join("")}${bearing(15, 24)}<circle r="6" class="gearbox-bearing-inner"/></g></g>`;
  return s;
}
const art = `<g class="mechanism-zoom">${GearArt()}</g>`;
const notes = {
  sun: "The central 18-tooth sun drives the planets through their outer teeth.",
  planets:
    "Three 18-tooth planets spin on their shafts while orbiting with the carrier.",
  ring: "The 54-tooth internal ring meshes with the outside of every planet.",
  carrier:
    "The carrier joins the planet shafts. With the ring held still, it turns once for four sun revolutions.",
};
export function Planetary() {
  const [running, setRunning] = useState(false),
    [rpm, setRpm] = useState(12),
    [lock, setLock] = useState<GearLock>("ring");
  const [zoom, setZoom] = useState(false);
  const [open, setOpen] = useState(true),
    [inspect, setInspect] = useState<keyof typeof notes>("planets");
  const reduced = useReducedMotion(),
    angle = useRef(0);
  const speeds = planetarySpeeds(lock, rpm);
  const draw = (delta = 0) => {
    angle.current += delta;
    const a = planetarySpeeds(lock, angle.current),
      root = ref.current;
    for (const [name, value] of [
      ["sun", a.sun],
      ["ring", a.ring],
      ["carrier", a.carrier],
      ["planets", a.carrier],
    ] as const)
      root
        ?.querySelector(`[data-${name}]`)
        ?.setAttribute("transform", `rotate(${value})`);
    root
      ?.querySelectorAll("[data-planet]")
      .forEach((el) =>
        el.setAttribute("transform", `rotate(${a.planetRelative})`),
      );
  };
  const ref = useLive((_, dt) => draw(dt * rpm * 6), running),
    paintRef = useRef(draw);
  paintRef.current = draw;
  useEffect(() => {
    angle.current = 0;
    paintRef.current();
  }, [lock]);
  useEffect(() => {
    ref.current
      ?.querySelector<SVGGElement>("[data-bearing-cover]")
      ?.setAttribute(
        "transform",
        `translate(${open ? 122 : 0} ${open ? -26 : 0})`,
      );
  }, [open, ref]);
  return (
    <div
      className="system-instrument gearbox-study"
      ref={ref}
      data-inspect={inspect}
      style={{ "--detail-zoom": zoom ? 1.5 : 1 } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 600 410"
        className="iso-svg"
        role="img"
        aria-label={`Planetary gearbox cutaway, ${lock} locked, ${open ? "bearing cover lifted" : "assembled"}`}
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls">
        <button
          aria-pressed={running}
          disabled={reduced}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? "pause" : "run"}
        </button>
        <button onClick={() => draw(30)}>turn input</button>
        <button aria-pressed={zoom} onClick={() => setZoom((v) => !v)}>
          {zoom ? "fit view" : "closer look"}
        </button>
        <button aria-pressed={open} onClick={() => setOpen((v) => !v)}>
          {open ? "close housing" : "open housing"}
        </button>
        <label>
          lock{" "}
          <select
            aria-label="Stationary gearbox part"
            value={lock}
            onChange={(e) => setLock(e.target.value as GearLock)}
          >
            <option value="ring">ring · 4:1</option>
            <option value="carrier">carrier · reverse</option>
            <option value="sun">sun · ring input</option>
          </select>
        </label>
        <label>
          input{" "}
          <input
            aria-label="Gearbox input RPM"
            type="range"
            min={-30}
            max={30}
            step={1}
            value={rpm}
            onChange={(e) => setRpm(+e.target.value)}
          />
        </label>
      </div>
      <output>
        sun {speeds.sun.toFixed(1)} · ring {speeds.ring.toFixed(1)} · carrier{" "}
        {speeds.carrier.toFixed(1)} rpm
      </output>
      <div className="mechanism-inspector">
        <div className="view-buttons" aria-label="Inspect gearbox part">
          {(["sun", "planets", "ring", "carrier"] as const).map((part) => (
            <button
              key={part}
              aria-pressed={inspect === part}
              onClick={() => setInspect(part)}
            >
              {part}
            </button>
          ))}
        </div>
        <p>{notes[inspect]}</p>
        <small>
          18 sun / 18 planet / 54 ring teeth · signed speeds show direction
        </small>
      </div>
    </div>
  );
}
