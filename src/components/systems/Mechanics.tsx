import { useEffect, useMemo, useRef, useState } from "react";
import {
  P,
  k,
  board,
  box,
  disc,
  line,
  screw,
  topMatrix,
  gearPath,
} from "./geometry";
import { useLive, useReducedMotion } from "./useLive";
function WatchArt(movement = false) {
  let s = `<g transform="translate(300 205)">`;
  for (const y of [-143, 88]) {
    s += `<path d="M-29 ${y}h58v58h-58z" class="watch-band"/>`;
    for (let i = 0; i < 6; i++) {
      const yy = y + i * 9;
      s += `<path d="M-27 ${yy}h54" class="watch-band-link"/><circle cx="-23" cy="${yy + 4}" r="1.2" class="watch-screw"/><circle cx="23" cy="${yy + 4}" r="1.2" class="watch-screw"/>`;
    }
  }
  for (const y of [-81, 66])
    for (const x of [-42, 33])
      s += `<rect x="${x}" y="${y}" width="9" height="18" rx="2" class="watch-lug"/>`;
  s += `<circle r="91" class="watch-case"/><circle r="85" class="watch-bezel"/><circle r="78" class="watch-dial"/>`;
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30;
    const inner = i % 5 === 0 ? 66 : 71;
    s += `<path d="M${Math.sin(a) * inner} ${-Math.cos(a) * inner}L${Math.sin(a) * 76} ${-Math.cos(a) * 76}" class="watch-index${i % 5 === 0 ? " major" : ""}"/>`;
  }
  if (movement) s += `<circle r="70" class="movement-plate"/>` + MovementArt();
  else {
    s += `<g class="watch-dial-labels">${[12, 3, 6, 9].map((n, i) => `<text x="${Math.sin((i * Math.PI) / 2) * 55}" y="${-Math.cos((i * Math.PI) / 2) * 55 + 4}" text-anchor="middle">${n}</text>`).join("")}</g>`;
    for (const [x, y] of [[-30, 12], [30, 12], [0, 39]])
      s += `<circle cx="${x}" cy="${y}" r="15" class="watch-subdial"/><circle cx="${x}" cy="${y}" r="12" class="watch-subdial-inner"/>`;
    s += `<path d="M0 0L-22 -26 M0 0L31 -28" class="watch-hour-hands"/><g data-watch-second><path d="M0 10V-65" class="watch-second"/></g><g transform="translate(-30 12)"><g data-watch-minute><path d="M0 2V-11" class="watch-subhand"/></g></g><circle r="4" class="system-hub"/><circle r="1.4" class="watch-screw"/>`;
  }
  s += `<rect x="91" y="-28" width="13" height="12" rx="3" class="watch-pusher"/><rect x="91" y="18" width="13" height="12" rx="3" class="watch-pusher"/><rect x="96" y="-7" width="18" height="14" rx="4" class="watch-crown"/>`;
  for (let i = 0; i < 7; i++) s += `<path d="M${99 + i * 2} -6v12" class="watch-crown-groove"/>`;
  for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
    const x = Math.cos((a * Math.PI) / 180) * 81;
    const y = Math.sin((a * Math.PI) / 180) * 81;
    s += `<circle cx="${x}" cy="${y}" r="1.7" class="watch-screw"/>`;
  }
  return s + "</g>";
}
function MovementArt() {
  const wheel = (x: number, y: number, r: number, teeth: number, id: string) =>
    `<g transform="translate(${x} ${y})"><circle r="${r + 2.5}" class="movement-well"/><g data-watch-gear="${id}"><path d="${gearPath(teeth, r)}" class="movement-wheel"/>${Array.from({ length: 5 }, (_, i) => `<path d="M3 -2 L${r - 5} -2 L${r - 5} 2 L3 2Z" transform="rotate(${i * 72})" class="movement-spoke"/>`).join("")}<circle r="3.5" class="movement-hub"/></g><circle r="1.6" class="movement-jewel"/></g>`;
  let s = "";
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    s += `<circle cx="${Math.cos(a) * 57}" cy="${Math.sin(a) * 57}" r="2" class="movement-hub"/><path d="M${Math.cos(a) * 57 - 1} ${Math.sin(a) * 57}h2" class="gear-engraving"/>`;
  }
  s += `<g data-watch-part="train">${wheel(-28, 12, 23, 46, "barrel")}${wheel(9, 12, 14, 28, "intermediate")}${wheel(32, 12, 9, 18, "seconds")}<g transform="translate(-28 12)"><path d="${k.pathOf(
    Array.from({ length: 160 }, (_, i) => {
      const a = (i / 159) * Math.PI * 8,
        r = 2 + (i / 159) * 15;
      return [Math.cos(a) * r, Math.sin(a) * r] as k.Flat;
    }),
  )}" class="movement-spring"/></g></g>`;
  s += `<g data-watch-part="balance"><g transform="translate(-10 -31)"><circle r="20" class="movement-well"/><g data-watch-balance><circle r="17" class="movement-balance"/><circle r="14.5" class="movement-balance"/>${Array.from({ length: 12 }, (_, i) => `<circle cx="${Math.cos((i * Math.PI) / 6) * 16}" cy="${Math.sin((i * Math.PI) / 6) * 16}" r="1.1" class="movement-hub"/>`).join("")}<path d="M-16 0h32 M0 -16v32" class="movement-spring"/></g><path d="${k.pathOf(
    Array.from({ length: 120 }, (_, i) => {
      const a = (i / 119) * Math.PI * 10,
        r = 1 + (i / 119) * 11;
      return [Math.cos(a) * r, Math.sin(a) * r] as k.Flat;
    }),
  )}" class="movement-hairspring" data-watch-hairspring/><circle cx="12" r="1.1" class="movement-hub"/><circle r="2" class="movement-jewel"/></g>${wheel(18, -27, 8, 15, "escape")}<g transform="translate(4 -16)"><g data-watch-pallet><path d="M-10 -4L0 0L13 -9 M0 0L2 8" class="movement-lever"/><circle cx="-10" cy="-4" r="1.4" class="movement-jewel"/><circle cx="13" cy="-9" r="1.4" class="movement-jewel"/></g><circle r="2" class="movement-hub"/></g></g>`;
  s += `<g data-watch-part="clutch"><g transform="translate(32 12)"><g data-watch-clutch><circle r="7" class="movement-clutch"/><circle r="4.5" class="movement-hub"/></g><g data-watch-chrono><path d="M0 0V-7" class="watch-second"/></g><circle r="1.2" class="movement-jewel"/></g><g transform="translate(40 -17)"><g data-watch-column><path d="${gearPath(8, 6)}" class="movement-wheel"/><path d="M-3 0h6" class="gear-engraving"/></g><circle r="1.4" class="movement-jewel"/></g><path d="M40 -17L48 -10L41 8" class="movement-lever"/><path d="M44 20L48 32L31 37" class="movement-lever"/></g>`;
  // Pierced bridges, bearing seats and slotted screws hold the moving train.
  s += `<path d="M-43 39Q-20 30 9 40L8 47Q-18 39 -40 46Z M-36 -43L-28 -47L4 -48L6 -42Z" class="movement-bridge"/>`;
  for (const [x, y] of [
    [-40, 42],
    [7, 43],
    [-31, -44],
    [1, -45],
  ])
    s += `<circle cx="${x}" cy="${y}" r="2.4" class="movement-hub"/><path d="M${x - 1.3} ${y}h2.6" class="gear-engraving"/>`;
  return s;
}
const watchArt = `<g class="mechanism-zoom">${WatchArt()}</g>`;
const watchMovementArt = `<g class="mechanism-zoom">${WatchArt(true)}</g>`;
const movementNotes = {
  train:
    "The 46, 28 and 18-tooth wheels mesh in alternating directions; the small wheel turns fastest.",
  balance:
    "The balance swings back and forth; the pallet releases the escape wheel one tooth at a time.",
  clutch:
    "Start engages the clutch with the running train. Stop holds the stopwatch while the movement keeps ticking.",
};
export function Chronograph() {
  const [view, setView] = useState<"dial" | "movement">("movement");
  const [zoom, setZoom] = useState(false);
  const [running, setRunning] = useState(false);
  const [timing, setTiming] = useState(false);
  const [rate, setRate] = useState(1);
  const [inspect, setInspect] = useState<keyof typeof movementNotes>("train");
  const reduced = useReducedMotion();
  const elapsed = useRef(0),
    movement = useRef(0);
  const output = useRef<HTMLOutputElement>(null);
  const paint = (dt = 0) => {
    movement.current += dt;
    if (timing) elapsed.current += dt;
    const root = ref.current;
    if (!root) return;
    const rotate = (selector: string, angle: number) =>
      root
        .querySelector(selector)
        ?.setAttribute("transform", `rotate(${angle})`);
    rotate("[data-watch-second]", elapsed.current * 6);
    rotate("[data-watch-minute]", (elapsed.current / 60) * 6);
    rotate('[data-watch-gear="barrel"]', (movement.current * 6 * 18) / 46);
    rotate(
      '[data-watch-gear="intermediate"]',
      (-movement.current * 6 * 18) / 28,
    );
    rotate('[data-watch-gear="seconds"]', movement.current * 6);
    rotate('[data-watch-gear="escape"]', Math.floor(movement.current * 8) * 12);
    rotate(
      "[data-watch-balance]",
      Math.sin(movement.current * 8 * Math.PI) * 110,
    );
    const swing =
      (Math.sin(movement.current * 8 * Math.PI) * 110 * Math.PI) / 180;
    root.querySelector("[data-watch-hairspring]")?.setAttribute(
      "d",
      k.pathOf(
        Array.from({ length: 120 }, (_, i) => {
          const t = i / 119,
            a = t * Math.PI * 10 + swing * (1 - t) * (1 - t),
            r = 1 + t * 11;
          return [Math.cos(a) * r, Math.sin(a) * r] as k.Flat;
        }),
      ),
    );
    rotate("[data-watch-pallet]", Math.sin(movement.current * 8 * Math.PI) * 9);
    rotate("[data-watch-chrono]", elapsed.current * 6);
    rotate("[data-watch-column]", timing ? 45 : 0);
    root
      .querySelector("[data-watch-clutch]")
      ?.setAttribute("opacity", timing ? "1" : ".35");
    if (output.current)
      output.current.textContent = `${Math.floor(elapsed.current / 60)
        .toString()
        .padStart(
          2,
          "0",
        )}:${(elapsed.current % 60).toFixed(1).padStart(4, "0")} elapsed · ${rate}× time · clutch ${timing ? "engaged" : "disengaged"}`;
  };
  const ref = useLive((_, dt) => paint(dt * rate), running);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  useEffect(() => {
    paintRef.current();
  }, [view, timing, rate]);
  return (
    <div
      className="system-instrument watch-study"
      ref={ref}
      data-inspect={inspect}
      style={{ "--detail-zoom": zoom ? 1.7 : 1 } as React.CSSProperties}
    >
      <svg
        viewBox="0 0 600 410"
        role="img"
        aria-label={`Chronograph ${view}, with a working gear train, balance, escapement and stopwatch clutch`}
        className="iso-svg"
        dangerouslySetInnerHTML={{
          __html: view === "dial" ? watchArt : watchMovementArt,
        }}
      />
      <div className="instrument-controls">
        <div className="view-buttons" aria-label="Watch view">
          {(["dial", "movement"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button aria-pressed={zoom} onClick={() => setZoom((v) => !v)}>
          {zoom ? "fit view" : "closer look"}
        </button>
        <button
          aria-pressed={running}
          disabled={reduced}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? "pause movement" : "run movement"}
        </button>
        <button
          aria-pressed={timing}
          onClick={() => {
            setTiming((v) => !v);
            if (!timing && !reduced) setRunning(true);
          }}
        >
          {timing ? "stop stopwatch" : "start stopwatch"}
        </button>
        <button
          disabled={timing}
          onClick={() => {
            elapsed.current = 0;
            paint();
          }}
        >
          reset stopwatch
        </button>
        <button onClick={() => paint(1)}>+1 second</button>
        <label>
          speed{" "}
          <select
            aria-label="Watch simulation speed"
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
          >
            <option value={0.125}>⅛×</option>
            <option value={1}>1×</option>
            <option value={8}>8×</option>
          </select>
        </label>
      </div>
      <output ref={output}>
        00:00.0 elapsed · 1× time · clutch disengaged
      </output>
      {view === "movement" && (
        <div className="mechanism-inspector">
          <div className="view-buttons" aria-label="Inspect watch mechanism">
            {(["train", "balance", "clutch"] as const).map((part) => (
              <button
                key={part}
                aria-pressed={inspect === part}
                onClick={() => setInspect(part)}
              >
                {part === "train"
                  ? "gear train"
                  : part === "balance"
                    ? "escapement"
                    : part}
              </button>
            ))}
          </div>
          <p>{movementNotes[inspect]}</p>
          <small>
            Illustrative movement, with a 4 Hz balance. Gear train and
            escapement shown as separate studies.
          </small>
        </div>
      )}
    </div>
  );
}
type Cubie = {
  id: number;
  x: number;
  y: number;
  z: number;
  stickers: Record<string, string>;
};
const vectorKey = (x: number, y: number, z: number) => `${x},${y},${z}`;
const FACE_COLOR: Record<string, string> = {
  "0,0,1": "#f2f0df",
  "0,0,-1": "#eac62d",
  "0,1,0": "#3e945b",
  "0,-1,0": "#4277b8",
  "1,0,0": "#ce493b",
  "-1,0,0": "#df7f2e",
};
function newCube(): Cubie[] {
  const cubes: Cubie[] = [];
  let id = 0;
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        const stickers: Record<string, string> = {};
        for (const [dx, dy, dz] of [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, 1],
          [0, 0, -1],
        ])
          if (dx * x + dy * y + dz * z === 1)
            stickers[vectorKey(dx, dy, dz)] = FACE_COLOR[vectorKey(dx, dy, dz)];
        cubes.push({ id: id++, x, y, z, stickers });
      }
  return cubes;
}
const FACE: Record<string, { axis: 0 | 1 | 2; sign: 1 | -1; name: string }> = {
  R: { axis: 0, sign: 1, name: "right" },
  L: { axis: 0, sign: -1, name: "left" },
  F: { axis: 1, sign: 1, name: "front" },
  B: { axis: 1, sign: -1, name: "back" },
  U: { axis: 2, sign: 1, name: "top" },
  D: { axis: 2, sign: -1, name: "bottom" },
};
function rotateVector(
  v: [number, number, number],
  axis: 0 | 1 | 2,
  turns: number,
): [number, number, number] {
  let [x, y, z] = v;
  for (let i = 0; i < ((turns % 4) + 4) % 4; i++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [x, z] = [z, -x];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}
function turnLayer(
  cubes: Cubie[],
  face: string,
  clockwise: boolean,
  amount: number,
): Cubie[] {
  const { axis, sign } = FACE[face],
    turns = (clockwise ? -sign : sign) * amount;
  return cubes.map((c) => {
    const point = [c.x, c.y, c.z] as [number, number, number];
    if (point[axis] !== sign) return c;
    const [x, y, z] = rotateVector(point, axis, turns),
      stickers: Record<string, string> = {};
    for (const [normal, color] of Object.entries(c.stickers)) {
      const [nx, ny, nz] = normal.split(",").map(Number) as [
        number,
        number,
        number,
      ];
      stickers[vectorKey(...rotateVector([nx, ny, nz], axis, turns))] = color;
    }
    return { ...c, x, y, z, stickers };
  });
}
function drawCube(cubes: Cubie[], apart: boolean, azimuth: number) {
  const p: k.Projection = {
    origin: [300, 235],
    scale: 1.35,
    azimuth,
    elevation: 30,
  };
  let s = board(172, 172, p);
  const entries = [...cubes].sort(
    (a, b) =>
      k.depthOf([a.x * 32, a.y * 32, a.z * 32], p) -
      k.depthOf([b.x * 32, b.y * 32, b.z * 32], p),
  );
  for (const c of entries) {
    const x = c.x * 32,
      y = c.y * 32,
      z = c.z * 32 + (apart && c.z === 1 ? 40 : 0);
    let part = box(x - 15, y - 15, z - 15, 30, 30, 30, p);
    for (const [normal, color] of Object.entries(c.stickers)) {
      const [nx, ny, nz] = normal.split(",").map(Number);
      let pts: k.Point3[] = [];
      if (nx === 1)
        pts = [
          [x + 15, y - 11, z - 11],
          [x + 15, y + 11, z - 11],
          [x + 15, y + 11, z + 11],
          [x + 15, y - 11, z + 11],
        ];
      else if (ny === 1)
        pts = [
          [x - 11, y + 15, z - 11],
          [x + 11, y + 15, z - 11],
          [x + 11, y + 15, z + 11],
          [x - 11, y + 15, z + 11],
        ];
      else if (nz === 1)
        pts = [
          [x - 11, y - 11, z + 15],
          [x + 11, y - 11, z + 15],
          [x + 11, y + 11, z + 15],
          [x - 11, y + 11, z + 15],
        ];
      else continue;
      part += `<path d="${k.pathOf(
        pts.map((v) => k.iso(v, p)),
        true,
      )}" fill="${color}" stroke="var(--anatomy-lo)" stroke-width=".8"/>`;
    }
    const center = k.iso([x, y, z], p);
    part = `<g data-cubie="${c.id}"><g transform="translate(${-center[0]} ${-center[1]})">${part}</g></g>`;
    s += `<g transform="translate(${center[0]} ${center[1]})">${part}</g>`;
  }
  if (apart) {
    s +=
      disc(0, 0, 43, 12, 3, p, true) +
      disc(0, 0, 83, 12, 3, p, true) +
      disc(0, 0, 48, 4, 34, p);
    s += line(k.ring(0, 0, 7, 85, p));
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      s += line(
        k.segment(
          [Math.cos(a) * 6, Math.sin(a) * 6, 47],
          [Math.cos(a) * 9, Math.sin(a) * 9, 79],
          p,
        ),
      );
    }
  }
  return s;
}
export function MaglevCube() {
  const [cubes, setCubes] = useState<Cubie[]>(newCube);
  const [face, setFace] = useState("R");
  const [clockwise, setClockwise] = useState(true);
  const [amount, setAmount] = useState(1);
  const [apart, setApart] = useState(false);
  const [azimuth, setAzimuth] = useState(38);
  const [moving, setMoving] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [scrambling, setScrambling] = useState(false);
  const view = useRef<HTMLDivElement>(null);
  const queue = useRef<ReturnType<typeof setTimeout> | null>(null);
  const art = useMemo(
    () => drawCube(cubes, apart, azimuth),
    [cubes, apart, azimuth],
  );
  const execute = (f = face, cw = clockwise, n = amount) => {
    const root = view.current;
    if (!root) return;
    const before = new Map(cubes.map((c) => [c.id, c]));
    const next = turnLayer(cubes, f, cw, n),
      offsets = new Map<number, [number, number]>();
    for (const c of next) {
      const old = before.get(c.id)!;
      const from = k.iso([old.x * 32, old.y * 32, old.z * 32], {
        origin: [0, 0],
        scale: 1.35,
        azimuth,
        elevation: 30,
      });
      const to = k.iso([c.x * 32, c.y * 32, c.z * 32], {
        origin: [0, 0],
        scale: 1.35,
        azimuth,
        elevation: 30,
      });
      if (from[0] !== to[0] || from[1] !== to[1])
        offsets.set(c.id, [from[0] - to[0], from[1] - to[1]]);
    }
    setCubes(next);
    setMoveCount((v) => v + 1);
    setMoving(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        root.querySelectorAll<SVGGElement>("[data-cubie]").forEach((el) => {
          const delta = offsets.get(Number(el.dataset.cubie));
          if (!delta) return;
          el.style.transform = `translate(${delta[0]}px, ${delta[1]}px)`;
          el.style.transition = "transform 420ms cubic-bezier(.2,.78,.25,1)";
          requestAnimationFrame(() => {
            el.style.transform = "translate(0px,0px)";
          });
        });
        setTimeout(() => {
          root.querySelectorAll<SVGGElement>("[data-cubie]").forEach((el) => {
            el.style.transition = "";
            el.style.transform = "";
          });
          setMoving(false);
        }, 450);
      }),
    );
  };
  useEffect(
    () => () => {
      if (queue.current) clearTimeout(queue.current);
    },
    [],
  );
  const scramble = () => {
    if (scrambling || moving) return;
    const seq: Array<[string, boolean, number]> = [
      ["R", true, 1],
      ["U", false, 1],
      ["F", true, 2],
      ["L", false, 1],
      ["D", true, 1],
      ["B", false, 1],
      ["R", false, 2],
      ["U", true, 1],
      ["F", false, 1],
      ["D", false, 2],
      ["L", true, 1],
      ["B", true, 1],
    ];
    let i = 0;
    setScrambling(true);
    const next = () => {
      if (i === seq.length) {
        setScrambling(false);
        return;
      }
      const [f, cw, n] = seq[i++];
      execute(f, cw, n);
      queue.current = setTimeout(next, 500);
    };
    next();
  };
  return (
    <div className="system-instrument cube-study" ref={view}>
      <svg
        viewBox="0 0 600 450"
        className="iso-svg"
        role="img"
        aria-label="Interactive six-face three-by-three speed cube. Select any layer to turn it and rotate the view."
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls cube-controls">
        <label>
          face{" "}
          <select
            aria-label="Rubik’s cube face"
            value={face}
            onChange={(e) => setFace(e.target.value)}
          >
            {Object.entries(FACE).map(([f, item]) => (
              <option value={f} key={f}>
                {f} · {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          aria-pressed={clockwise}
          onClick={() => setClockwise((v) => !v)}
        >
          {clockwise ? "clockwise" : "counterclockwise"}
        </button>
        <label>
          turn{" "}
          <select
            aria-label="Turn amount"
            value={amount}
            onChange={(e) => setAmount(+e.target.value)}
          >
            <option value={1}>quarter</option>
            <option value={2}>half</option>
            <option value={3}>three quarters</option>
          </select>
        </label>
        <button
          disabled={moving || scrambling}
          onClick={() => execute()}
          aria-label="Turn the selected face"
        >
          turn {face}
        </button>
        <button disabled={moving || scrambling} onClick={scramble}>
          {scrambling ? "scrambling…" : "scramble"}
        </button>
        <button aria-pressed={apart} onClick={() => setApart((v) => !v)}>
          {apart ? "close core" : "maglev core"}
        </button>
        <button
          onClick={() => {
            setCubes(newCube());
            setMoveCount(0);
          }}
        >
          reset cube
        </button>
      </div>
      <div className="instrument-controls cube-camera">
        <label>
          rotate view{" "}
          <input
            aria-label="Cube view angle"
            type="range"
            min={18}
            max={72}
            value={azimuth}
            onChange={(e) => setAzimuth(+e.target.value)}
          />
        </label>
      </div>
      <output aria-live="polite">
        {moving
          ? "turn in progress · smooth layer motion"
          : `${face} ${clockwise ? "clockwise" : "counterclockwise"} · ${amount === 2 ? "180°" : amount === 3 ? "270°" : "90°"} · ${moveCount} turns · ${apart ? "maglev core exposed" : "26 movable cubies"}`}
      </output>
    </div>
  );
}
