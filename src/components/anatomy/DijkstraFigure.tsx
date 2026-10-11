"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* Anatomy Fig 2 — Dijkstra: a hill relay office (pure SVG).
   Object is explanation: 7 relay huts on posts, ropeways between them.
   Rope length = cost, shown as collar beads on rope (no floating labels).
   Surveyor visits closest unvisited hut first — that order is Dijkstra. */

const COS = 0.8660254;
const SIN = 0.5;
const VW = 800;
const VH = 500;
const CX = 400;
const CY = 290;
const P = (x: number, y: number, z: number): [number, number] => [
  CX + (x - y) * COS,
  CY + (x + y) * SIN - z,
];
const d = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
const line = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

type Node = { id: number; name: string; x: number; y: number };
const NODES: Node[] = [
  { id: 0, name: "mill", x: -118, y: -52 },
  { id: 1, name: "bridge", x: -46, y: -66 },
  { id: 2, name: "chapel", x: 34, y: -58 },
  { id: 3, name: "market", x: -84, y: 8 },
  { id: 4, name: "forge", x: -6, y: 6 },
  { id: 5, name: "harbor", x: 76, y: 2 },
  { id: 6, name: "lighthouse", x: 6, y: 64 },
];
type Edge = { a: number; b: number; w: number };
const EDGES: Edge[] = [
  { a: 0, b: 1, w: 4 }, { a: 1, b: 2, w: 3 }, { a: 0, b: 3, w: 2 },
  { a: 1, b: 3, w: 5 }, { a: 1, b: 4, w: 6 }, { a: 2, b: 5, w: 5 },
  { a: 3, b: 4, w: 1 }, { a: 4, b: 5, w: 2 }, { a: 3, b: 6, w: 7 },
  { a: 4, b: 6, w: 3 }, { a: 5, b: 6, w: 4 }, { a: 2, b: 4, w: 4 },
];

function dijkstra(start: number, end: number) {
  const dist = new Array(NODES.length).fill(Infinity);
  const prev = new Array(NODES.length).fill(-1);
  const visited: number[] = [];
  const settled = new Array(NODES.length).fill(false);
  dist[start] = 0;
  for (;;) {
    let u = -1;
    let best = Infinity;
    for (let i = 0; i < NODES.length; i++) {
      if (!settled[i] && dist[i] < best) { best = dist[i]; u = i; }
    }
    if (u === -1 || best === Infinity) break;
    settled[u] = true;
    visited.push(u);
    if (u === end) break;
    for (const e of EDGES) {
      const v = e.a === u ? e.b : e.b === u ? e.a : -1;
      if (v === -1 || settled[v]) continue;
      if (dist[u] + e.w < dist[v]) {
        dist[v] = dist[u] + e.w;
        prev[v] = u;
      }
    }
  }
  const path: number[] = [];
  if (dist[end] < Infinity) {
    let c = end;
    while (c !== -1) { path.unshift(c); c = prev[c]; }
  }
  return { dist, prev, visited, path, cost: dist[end] };
}

function Hut({ n, tone, selected, onPick }: { n: Node; tone: string; selected: string; onPick: () => void }) {
  const { x, y } = n;
  const base = d([P(x - 13, y - 10, 34), P(x + 13, y - 10, 34), P(x + 13, y + 10, 34), P(x - 13, y + 10, 34)]);
  const fS = d([P(x - 13, y + 10, 22), P(x + 13, y + 10, 22), P(x + 13, y + 10, 34), P(x - 13, y + 10, 34)]);
  const fE = d([P(x + 13, y - 10, 22), P(x + 13, y + 10, 22), P(x + 13, y + 10, 34), P(x + 13, y - 10, 34)]);
  const r1 = d([P(x - 16, y, 34), P(x, y - 13, 34), P(x, y - 13, 42), P(x - 16, y, 42)]);
  const r2 = d([P(x, y - 13, 34), P(x + 16, y, 34), P(x + 16, y, 42), P(x, y - 13, 42)]);
  const r3 = d([P(x - 16, y, 34), P(x, y + 13, 34), P(x, y + 13, 42), P(x - 16, y, 42)]);
  const r4 = d([P(x, y + 13, 34), P(x + 16, y, 34), P(x + 16, y, 42), P(x, y + 13, 42)]);
  const door = d([P(x - 4, y + 10, 22), P(x + 4, y + 10, 22), P(x + 4, y + 10, 30), P(x - 4, y + 10, 30)]);
  const [lx, ly] = P(x, y - 10, 28);
  return (
    <g style={{ cursor: "pointer" }} onClick={onPick} tabIndex={0} role="button" aria-label={`Station ${n.name}`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick())}>
      {/* post + collar */}
      <path className="iso-shade" data-shade="1" d={d([P(x - 3, y - 3, 12), P(x + 3, y - 3, 12), P(x + 3, y + 3, 22), P(x - 3, y + 3, 22)])} />
      <path className="iso-line" data-tone="mid" d={line([P(x - 3, y + 3, 12), P(x - 3, y + 3, 22)])} />
      {/* hut body */}
      <g className="iso-solid" data-lit={tone === "lit" ? "" : undefined}>
        <path className="iso-shade" data-shade="0" d={fE} />
        <path className="iso-shade" data-shade="2" d={fS} />
        <path className="iso-top" d={base} />
        <path className="iso-line" data-tone={tone} d={base} />
        <path className="iso-line" data-tone={tone} d={line([P(x - 13, y + 10, 22), P(x + 13, y + 10, 22), P(x + 13, y + 10, 34)])} />
      </g>
      {/* roof: 4 faces */}
      <path className="iso-shade" data-shade="1" d={r1} />
      <path className="iso-shade" data-shade="3" d={r2} />
      <path className="iso-shade" data-shade="0" d={r3} />
      <path className="iso-shade" data-shade="2" d={r4} />
      <path className="iso-line" data-tone={tone} d={line([P(x - 16, y, 42), P(x, y - 13, 42), P(x + 16, y, 42)])} />
      <path className="iso-line" data-tone="faint" d={door} />
      <circle cx={lx} cy={ly} r={selected === "s" || selected === "e" ? 5 : 3}
        fill="none" strokeWidth={0.8} className="iso-line" data-tone={tone} />
      {selected === "s" && <circle cx={lx} cy={ly} r={1.6} className="iso-dots" fill="currentColor" />}
      {selected === "e" && <circle cx={lx} cy={ly} r={1.6} className="iso-dots" fill="currentColor" />}
    </g>
  );
}

export default function DijkstraFigure() {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(5);
  const [step, setStep] = useState(NODES.length);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [clicks, setClicks] = useState(0);
  const reduced = useRef(false);
  const inView = useRef(true);

  const full = useMemo(() => dijkstra(start, end), [start, end]);
  const shown = full.visited.slice(0, Math.min(step, full.visited.length));
  const settledSet = new Set(shown);
  const pathShown = step >= full.visited.length ? full.path : [];
  const pathSet = new Set(pathShown);
  const frontier = step < full.visited.length ? full.visited[Math.min(step, full.visited.length - 1)] : -1;

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver((e) => (inView.current = e[0].isIntersecting));
    const el = document.getElementById("dijkstra-stage");
    if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  // idle tour: auto-play once when untouched
  useEffect(() => {
    const t = setTimeout(() => {
      if (step >= NODES.length && !playing) {
        setStep(0);
        setPlaying(true);
      }
    }, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (step >= full.visited.length) {
      setPlaying(false);
      return;
    }
    if (reduced.current) {
      setStep(full.visited.length);
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => {
      if (inView.current) setStep((s) => s + 1);
    }, 650 / speed);
    return () => clearTimeout(t);
  }, [playing, step, full.visited.length, speed]);

  const pick = (id: number) => {
    if (clicks % 2 === 0) {
      setStart(id);
      if (id === end) setEnd((id + 3) % NODES.length);
    } else {
      setEnd(id);
    }
    setClicks((c) => c + 1);
    setStep(0);
    setPlaying(false);
  };

  const readout = full.cost < Infinity
    ? `visited ${shown.length}/${full.visited.length} · ${NODES[end].name} = ${full.cost} · path ${pathShown.length || "—"}`
    : `visited ${shown.length} · no route`;

  return (
    <div>
      <div id="dijkstra-stage" className="fx-stage" role="img" tabIndex={0}
        aria-label={`Relay office graph. Start ${NODES[start].name}, end ${NODES[end].name}. ${readout}.`}
        onKeyDown={(e) => {
          if (e.key === " ") { e.preventDefault(); setPlaying((v) => !v); }
          if (e.key.toLowerCase() === "n") setStep((s) => Math.min(full.visited.length, s + 1));
          if (e.key.toLowerCase() === "r") { setStep(0); setPlaying(false); }
        }}>
        <svg className="iso-svg" viewBox={`0 0 ${VW} ${VH}`}>
          <ellipse className="iso-halo" cx={CX} cy={CY + 128} rx={260} ry={26} />
          {/* base plate on feet */}
          {[[-158, -88], [142, -88], [142, 88], [-158, 88]].slice(2).map(([x, y], k) => {
            const [sx, sy] = P(x, y, 0);
            return <ellipse key={k} cx={sx} cy={sy + 4} rx={9} ry={4.5} className="iso-shade" data-shade="0" />;
          })}
          <path className="iso-shade" data-shade="2" d={d([P(-168, 88, 0), P(152, 88, 0), P(152, 88, 12), P(-168, 88, 12)])} />
          <path className="iso-shade" data-shade="0" d={d([P(152, -88, 0), P(152, 88, 0), P(152, 88, 12), P(152, -88, 12)])} />
          <path className="iso-top" d={d([P(-168, -88, 12), P(152, -88, 12), P(152, 88, 12), P(-168, 88, 12)])} />
          <path className="iso-line" data-tone="mid" d={d([P(-168, -88, 12), P(152, -88, 12), P(152, 88, 12), P(-168, 88, 12)])} />
          <path className="iso-line" data-tone="faint" d={d([P(-158, -78, 12), P(142, -78, 12), P(142, 78, 12), P(-158, 78, 12)])} />
          {[[-158, -88], [142, -88], [142, 88], [-158, 88]].map(([x, y], k) => {
            const [sx, sy] = P(x, y, 12);
            return (
              <g key={k}>
                <circle cx={sx} cy={sy} r={4.4} fill="none" strokeWidth={0.6} className="iso-line" data-tone="lo" />
                <circle cx={sx} cy={sy} r={1} className="iso-dots" fill="currentColor" />
              </g>
            );
          })}
          {/* ropes back-to-front: draw far (small y) first */}
          {[...EDGES]
            .map((e, i) => ({ e, i }))
            .sort((a, b) => NODES[a.e.a].y + NODES[a.e.b].y - (NODES[b.e.a].y + NODES[b.e.b].y))
            .map(({ e, i }) => {
              const A = NODES[e.a];
              const B = NODES[e.b];
              const a = P(A.x, A.y, 30);
              const b = P(B.x, B.y, 30);
              const onPath = pathSet.has(e.a) && pathSet.has(e.b) &&
                Math.abs(pathShown.indexOf(e.a) - pathShown.indexOf(e.b)) === 1;
              const touched = settledSet.has(e.a) && settledSet.has(e.b);
              const tone = onPath ? "lit" : touched ? "mid" : "lo";
              const beads = Array.from({ length: e.w }).map((_, k) => {
                const t = (k + 1) / (e.w + 1);
                return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 3] as [number, number];
              });
              return (
                <g key={i}>
                  <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} fill="none" strokeWidth={onPath ? 1.6 : 1}
                    className="iso-line" data-tone={tone} data-flow={onPath ? "" : undefined} />
                  {beads.map((pt, k) => (
                    <circle key={k} cx={pt[0]} cy={pt[1]} r={onPath ? 2.4 : 1.7}
                      fill="none" strokeWidth={0.6} className="iso-line" data-tone={tone} />
                  ))}
                  <circle cx={a[0]} cy={a[1]} r={2} className="iso-wire-end" />
                  <circle cx={b[0]} cy={b[1]} r={2} className="iso-wire-end" />
                </g>
              );
            })}
          {/* huts */}
          {[...NODES].sort((a, b) => a.y - b.y).map((n) => (
            <Hut key={n.id} n={n} onPick={() => pick(n.id)}
              selected={n.id === start ? "s" : n.id === end ? "e" : ""}
              tone={
                pathSet.has(n.id) && step >= full.visited.length ? "lit"
                : n.id === frontier ? "lit"
                : settledSet.has(n.id) ? "mid"
                : n.id === start || n.id === end ? "hi" : "lo"
              } />
          ))}
          {/* surveyor carriage: moves along visited order */}
          {shown.length > 0 && (() => {
            const cur = NODES[shown[shown.length - 1]];
            const [sx, sy] = P(cur.x + 18, cur.y + 2, 12);
            return (
              <g>
                <path className="iso-shade" data-shade="2" d={d([P(cur.x + 12, cur.y - 4, 12), P(cur.x + 24, cur.y - 4, 12), P(cur.x + 24, cur.y - 4, 18), P(cur.x + 12, cur.y - 4, 18)])} />
                <circle cx={sx} cy={sy - 12} r={4} fill="none" strokeWidth={0.8} className="iso-line" data-tone="lit" />
                <circle cx={sx} cy={sy - 12} r={1.4} className="iso-dots" fill="currentColor" />
              </g>
            );
          })()}
          {/* ruler + label plate */}
          {Array.from({ length: 15 }).map((_, k) => {
            const x = -120 + k * 16;
            const [a, b] = [P(x, 80, 12), P(x, 80 + (k % 5 === 0 ? 4 : 2.4), 12)];
            return <path key={k} className="iso-line" data-tone={k % 5 === 0 ? "mid" : "lo"} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} />;
          })}
        </svg>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button type="button" onClick={() => setPlaying((v) => !v)}
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: "var(--anatomy-card)", color: "var(--anatomy-strong)", cursor: "pointer" }}>
          {playing ? "pause" : step === 0 ? "play ▸" : "resume ▸"}
        </button>
        <button type="button" onClick={() => { setStep((s) => Math.min(full.visited.length, s + 1)); setPlaying(false); }}
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: "transparent", color: "inherit", cursor: "pointer" }}>
          step
        </button>
        <button type="button" onClick={() => { setStep(0); setPlaying(false); }}
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: "transparent", color: "inherit", cursor: "pointer" }}>
          reset
        </button>
        <label style={{ fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
          speed
          <input type="range" min={0.5} max={3} step={0.5} value={speed} aria-label="Playback speed"
            onChange={(e) => setSpeed(Number(e.target.value))} />
          <span>{speed}×</span>
        </label>
        <span style={{ fontSize: 12, opacity: 0.8 }}>start <b>{NODES[start].name}</b> → end <b>{NODES[end].name}</b> · click huts to change</span>
        <span aria-live="polite" style={{ marginLeft: "auto", fontFamily: "var(--anatomy-mono)", fontSize: 11 }}>{readout}</span>
      </div>
      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
        dist: {NODES.map((n, i) => `${n.name}=${full.dist[i] === Infinity ? "∞" : full.dist[i]}`).join(" · ")}
      </p>
    </div>
  );
}
