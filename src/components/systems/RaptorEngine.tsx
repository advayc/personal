import { useEffect, useMemo, useRef, useState } from "react";
import { k, board, box, disc, line, screw } from "./geometry";
import { useLive, useReducedMotion } from "./useLive";
function ring(radius: number, z: number, p: k.Projection, segments = 48) {
  return Array.from({ length: segments }, (_, i) =>
    k.iso(
      [
        Math.cos((i * 2 * Math.PI) / segments) * radius,
        Math.sin((i * 2 * Math.PI) / segments) * radius,
        z,
      ],
      p,
    ),
  );
}
function wrap(points: k.Flat[], closed = true) {
  return k.pathOf(points, closed);
}
function engineArt(view: number) {
  const p: k.Projection = {
    origin: [300, 220],
    scale: 1.25,
    azimuth: view,
    elevation: 24,
  };
  let s = board(200, 165, p);
  // Mount plate, feet, fasteners, outer structural rails, and vibration isolators.
  s +=
    box(-78, -60, -2, 156, 120, 9, p) +
    line(k.planOutline({ x: -72, y: -54, w: 144, d: 108, r: 2 }, 7, p));
  for (const x of [-65, 65])
    for (const y of [-45, 45])
      s += disc(x, y, -10, 8, 8, p) + screw(x, y, -1, p);
  for (const x of [-70, -48, 48, 70])
    for (const y of [-32, 32]) s += box(x - 3, y - 3, 7, 6, 6, 68, p);
  // Two staged-combustion preburner housings, each with its own retaining ring and ports.
  for (const [x, z, color] of [
    [-38, 94, "#72a6ba"],
    [38, 82, "#d99a53"],
  ] as [number, number, string][]) {
    s +=
      disc(x, 0, z, 17, 25, p) +
      disc(x, 0, z + 25, 19, 3, p) +
      disc(x, 0, z - 3, 13, 4, p);
    s += line(k.knurl(x, 0, 17, 2, z + 26, 32, p));
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      s += screw(x + Math.cos(a) * 15, Math.sin(a) * 15, z + 29, p);
    }
    const c = k.iso([x, 0, z + 30], p);
    s += `<g data-pump="${color}" transform="translate(${c[0]} ${c[1]})"><g transform="translate(${-c[0]} ${-c[1]})">${line(k.radialTicks(x, 0, 10, 8, 2, z + 31, [4, 8], p).major, true)}</g></g>`;
  }
  // Turbopump manifold: valves, circular flanges, cap screws, and paired feed pipes.
  for (const x of [-59, 59]) {
    s +=
      disc(x, -10, 68, 9, 12, p, true) +
      disc(x, -10, 80, 11, 3, p) +
      disc(x, -10, 66, 11, 3, p);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      s += screw(x + Math.cos(a) * 9, -10 + Math.sin(a) * 9, 81, p);
    }
  }
  for (const [x, y, z, shift] of [
    [-61, -16, 65, -39],
    [61, -16, 59, 39],
  ] as [number, number, number, number][]) {
    const path: [
      [number, number, number],
      [number, number, number],
      [number, number, number],
      [number, number, number],
      [number, number, number],
    ] = [
      [x, y, z],
      [x + shift * 0.18, y, z - 6],
      [x + shift * 0.62, y, z - 15],
      [x + shift * 0.8, y, z - 30],
      [shift, y, z - 32],
    ];
    s += line(
      k.pathOf(
        path.map((pt) => k.iso(pt, p)),
        false,
      ),
      true,
    );
    s += disc(path[0][0], path[0][1], path[0][2], 4, 4, p, true);
    for (let i = 1; i < 5; i++)
      s += disc(path[i][0], path[i][1], path[i][2], 2, 2, p);
    for (let i = 0; i < 9; i++) {
      const a = i / 8;
      const q = [
        x + shift * 0.18 * a,
        y + Math.sin(a * 3 * Math.PI) * 5,
        z - 8 - 22 * a,
      ] as [number, number, number];
      s += box(q[0] - 1, q[1] - 1, q[2], 2, 2, 1.5, p, colorValue(shift));
    }
  }
  // Main combustion chamber, injector head and ring bolts.
  s += '<g data-engine-gimbal transform="rotate(0)">';
  s += `<path d="${wrap(ring(22, 108, p))} ${wrap(ring(22, 161, p).reverse())}" fill="#242422" fill-rule="evenodd" stroke="var(--anatomy-hi)" stroke-width="1"/>`;
  for (const z of [109, 115, 121, 127, 133, 139, 145, 151, 158, 162])
    s += line(
      wrap(ring(z === 109 || z === 162 ? 23.5 : 22.8, z, p)),
      z === 109 || z === 162,
    );
  for (let i = 0; i < 24; i++) {
    const a = (i * 2 * Math.PI) / 24,
      x = 22 * Math.cos(a),
      y = 22 * Math.sin(a);
    s += disc(x, y, 157, 1.5, 4, p, i % 3 === 0);
  }
  s +=
    disc(0, 0, 158, 8, 5, p, true) +
    disc(0, 0, 163, 4, 2, p) +
    line(k.knurl(0, 0, 23, 1, 110, 159, p));
  // Regenerative cooling jacket uses paired vertical channel runs around the chamber and nozzle.
  for (let i = 0; i < 32; i++) {
    const a = (2 * Math.PI * i) / 32,
      r = 24.1,
      x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    const z0 = 3 + (i % 2) * 1.5,
      z1 = 107;
    s += line(k.segment([x, y, z0], [x, y, z1], p), i % 2 === 0);
    if (i % 2 === 0) {
      s += disc(x, y, z1, 1, 2, p, true);
    }
  }
  // Converging throat and divergent nozzle are rings cut in section; the outer jacket stays visible.
  const shape: [[number, number], [number, number]][] = [
    [
      [23, 108],
      [18, 90],
    ],
    [
      [18, 90],
      [13, 64],
    ],
    [
      [13, 64],
      [11, 48],
    ],
    [
      [11, 48],
      [12, 30],
    ],
    [
      [12, 30],
      [16, 14],
    ],
    [
      [16, 14],
      [23, 2],
    ],
  ];
  for (const [a, b] of shape) {
    s += `<path d="${wrap(ring(a[0], a[1], p))} ${wrap(ring(b[0], b[1], p).reverse())}" fill="var(--anatomy-shade-2)" fill-rule="evenodd" stroke="var(--anatomy-hi)" stroke-width="1.1"/>`;
  }
  for (const [r, z] of [
    [23, 108],
    [18, 90],
    [13, 64],
    [11, 48],
    [12, 30],
    [16, 14],
    [23, 2],
  ] as [number, number][])
    s += line(wrap(ring(r, z, p)), z === 2 || z === 48);
  s += "</g>";
  for (let z = 18; z <= 100; z += 9) {
    const r = z > 90 ? 19 : z > 64 ? 14 : z > 48 ? 11.5 : z > 30 ? 12 : 17;
    s += line(wrap(ring(r, z, p)), z === 18 || z === 99);
    for (let i = 0; i < 12; i++) {
      const a = (2 * Math.PI * i) / 12,
        x = r * Math.cos(a),
        y = r * Math.sin(a);
      s += screw(x, y, z, p);
    }
  }
  // Nozzle exit, igniter, static flame guide, sensor taps and small engraved part plate.
  s += disc(0, 0, 1, 23, 3, p, true) + disc(0, 0, 4, 10, 2, p);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    s += line(
      k.segment(
        [10 * Math.cos(a), 10 * Math.sin(a), 1],
        [18 * Math.cos(a), 18 * Math.sin(a), 2],
        p,
      ),
    );
  }
  for (const x of [-27, 27])
    for (const z of [55, 93, 132]) {
      s += box(x - 3, -2, z, 6, 4, 3, p) + screw(x, 0, z + 3, p);
    }
  const nozzle = ring(7, -63, p);
  s += `<path d="${wrap(nozzle)}" fill="var(--anatomy-red)" opacity=".8" class="raptor-plume" data-plume/><path d="${wrap(ring(4, -47, p))}" fill="#ffcc6b" opacity=".9" class="raptor-plume"/><path d="M${k.iso([0, 0, -8], p).join(" ")} L${k.iso([0, 0, -58], p).join(" ")}" class="raptor-thrust-vector"/>`;
  const label = k.iso([0, -56, 12], p);
  s += `<g transform="translate(${label[0]} ${label[1]})"><text x="0" y="0" text-anchor="middle" class="chip-engraving">RAPTOR · LOX / CH₄</text></g>`;
  return s;
}
function colorValue(shift: number) {
  return shift < 0;
}
export function RaptorEngine() {
  const [ignited, setIgnited] = useState(false);
  const [throttle, setThrottle] = useState(0);
  const [gimbal, setGimbal] = useState(0);
  const [view, setView] = useState(36);
  const art = useMemo(() => engineArt(view), [view]);
  const seconds = useRef(0);
  const reduced = useReducedMotion();
  const ref = useLive((_, dt) => {
    seconds.current += dt;
    const root = ref.current;
    if (!root) return;
    root
      .querySelectorAll<SVGGElement>("[data-pump]")
      .forEach((el, i) =>
        el.setAttribute(
          "transform",
          `${el.getAttribute("transform")?.split(" rotate(")[0]} rotate(${seconds.current * (i ? 510 : -680)})`,
        ),
      );
    root.querySelectorAll<SVGPathElement>("[data-plume]").forEach((el, i) => {
      const pulse = 1 + Math.sin(seconds.current * 13 + i * 1.8) * 0.065;
      el.setAttribute(
        "transform",
        `scale(1 ${pulse * (0.4 + throttle / 100)})`,
      );
      el.setAttribute("opacity", String(0.12 + throttle / 120));
    });
  }, ignited && !reduced);
  const graphic = art;
  useEffect(() => {
    const engine = ref.current?.querySelector("[data-engine-gimbal]");
    if (!engine) return;
    const center = k.iso([0, 0, 85], {
      origin: [300, 220],
      scale: 1.25,
      azimuth: view,
      elevation: 24,
    });
    engine.setAttribute(
      "transform",
      `rotate(${gimbal} ${center[0]} ${center[1]})`,
    );
  }, [gimbal, view, ref]);
  return (
    <div
      className="system-instrument raptor-study"
      ref={ref}
      style={{ "--throttle": throttle / 100 } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 600 480"
        className="iso-svg"
        role="img"
        aria-label={`Interactive schematic SpaceX Raptor methane-oxygen engine, ${ignited ? "ignited" : "cut off"}, throttle ${throttle} percent, gimbal ${gimbal} degrees`}
        dangerouslySetInnerHTML={{ __html: graphic }}
      />
      <div className="instrument-controls raptor-controls">
        <button aria-pressed={ignited} onClick={() => setIgnited((v) => !v)}>
          {ignited ? "cut off" : "ignite"}
        </button>
        <label>
          throttle{" "}
          <input
            aria-label="Engine throttle percent"
            type="range"
            min={0}
            max={100}
            step={5}
            value={throttle}
            disabled={!ignited}
            onChange={(e) => setThrottle(+e.target.value)}
          />
        </label>
        <label>
          gimbal{" "}
          <input
            aria-label="Engine gimbal angle"
            type="range"
            min={-10}
            max={10}
            value={gimbal}
            onChange={(e) => {
              const v = +e.target.value;
              setGimbal(v);
              const engine = ref.current?.querySelector("[data-engine-gimbal]");
              if (engine) {
                const c = k.iso([0, 0, 85], {
                  origin: [300, 220],
                  scale: 1.25,
                  azimuth: view,
                  elevation: 24,
                });
                engine.setAttribute(
                  "transform",
                  `rotate(${v} ${c[0]} ${c[1]})`,
                );
              }
            }}
          />
        </label>
        <label>
          camera{" "}
          <input
            aria-label="Engine camera angle"
            type="range"
            min={18}
            max={72}
            value={view}
            onChange={(e) => setView(+e.target.value)}
          />
        </label>
        <button onClick={() => setThrottle(0)} disabled={!ignited}>
          idle
        </button>
      </div>
      <div className="thrust-gauge" aria-hidden="true">
        <span style={{ width: `${ignited ? throttle : 0}%` }} />
      </div>
      <output>
        {ignited
          ? `running · ${throttle}% throttle · relative thrust ${Math.round(throttle)}% · gimbal ${gimbal}°`
          : "cut off · LOX and methane feed lines · not an engineering thrust simulation"}
      </output>
    </div>
  );
}
