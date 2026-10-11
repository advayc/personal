"use client";
import { useEffect, useMemo, useRef, useState } from "react";

/* Anatomy Fig 1 — GPU: a tile-painting factory.
   Object is explanation: dispatcher gantry (scheduler) feeds triangles
   to 16 press benches (shader cores) that paint tiles in parallel.
   VRAM shelf (left) holds work, framebuffer screen (right) shows result.
   SVG back + WebGL heat canvas + SVG front, same iso camera. */

const COS = 0.8660254;
const SIN = 0.5;
const VW = 800;
const VH = 500;
const CX = 400;
const CY = 300;
const P = (x: number, y: number, z: number): [number, number] => [
  CX + (x - y) * COS,
  CY + (x + y) * SIN - z,
];
const d = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";
const line = (pts: [number, number][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

const CORES = 16;
const coreXY = (i: number): [number, number] => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return [-78 + col * 34, -38 + row * 30];
};
const coreUV = (i: number): [number, number] => {
  const [x, y] = coreXY(i);
  const [sx, sy] = P(x + 8, y + 7, 26);
  return [sx / VW, 1 - sy / VH];
};

function Box(o: {
  x: number; y: number; w: number; d: number; z0: number; z1: number;
  lit?: boolean; shadeA?: string; shadeB?: string; edge?: "hi" | "mid" | "lo" | "lit";
}) {
  const { x, y, w, d: dd, z0, z1, lit, edge = "lo" } = o;
  const top = d([P(x, y, z1), P(x + w, y, z1), P(x + w, y + dd, z1), P(x, y + dd, z1)]);
  const front = d([P(x, y + dd, z0), P(x + w, y + dd, z0), P(x + w, y + dd, z1), P(x, y + dd, z1)]);
  const side = d([P(x + w, y, z0), P(x + w, y + dd, z0), P(x + w, y + dd, z1), P(x + w, y, z1)]);
  const outline = line([P(x, y + dd, z1), P(x, y, z1), P(x + w, y, z1), P(x + w, y + dd, z1)]);
  const outline2 = line([P(x, y + dd, z0), P(x + w, y + dd, z0), P(x + w, y + dd, z1)]);
  const outline3 = line([P(x + w, y, z0), P(x + w, y, z1)]);
  return (
    <g className="iso-solid" data-lit={lit ? "" : undefined}>
      <path className="iso-shade" data-shade="0" d={side} />
      <path className="iso-shade" data-shade="2" d={front} />
      <path className="iso-top" d={top} />
      <path className="iso-line" data-tone={edge} d={outline} />
      <path className="iso-line" data-tone={edge} d={outline2} />
      <path className="iso-line" data-tone={edge} d={outline3} />
    </g>
  );
}

function Cyl(o: { x: number; y: number; r: number; z0: number; z1: number; lit?: boolean }) {
  const { x, y, r, z0, z1, lit } = o;
  const [cx1, cy1] = P(x, y, z1);
  const [cx0, cy0] = P(x, y, z0);
  const rx = r;
  const ry = r * 0.5;
  const body = `M${(cx1 - rx).toFixed(1)} ${cy1.toFixed(1)} L${(cx0 - rx).toFixed(1)} ${cy0.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${(cx0 + rx).toFixed(1)} ${cy0.toFixed(1)} L${(cx1 + rx).toFixed(1)} ${cy1.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${(cx1 - rx).toFixed(1)} ${cy1.toFixed(1)} Z`;
  const topEl = `M${(cx1 - rx).toFixed(1)} ${cy1.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(cx1 + rx).toFixed(1)} ${cy1.toFixed(1)} A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(cx1 - rx).toFixed(1)} ${cy1.toFixed(1)} Z`;
  return (
    <g className="iso-solid" data-lit={lit ? "" : undefined}>
      <path className="iso-shade" data-shade="1" d={body} />
      <path className="iso-top" d={topEl} />
      <path className="iso-line" data-tone={lit ? "lit" : "mid"} d={topEl} />
    </g>
  );
}

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform float uTime; uniform float uPaper;
uniform vec2 uPos[${CORES}];
uniform float uGlow[${CORES}];
uniform vec3 uInk;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec2 uv = vUv;
  float g = 0.0;
  for(int i=0;i<${CORES};i++){
    vec2 q = (uv - uPos[i]) * vec2(1.6, 1.0);
    float dd = dot(q,q);
    float pulse = 0.82 + 0.18*sin(uTime*2.6 + float(i)*1.7);
    g += uGlow[i] * pulse * exp(-dd*260.0);
  }
  float n = hash(floor(uv*220.0)) * 0.05;
  g += n * g;
  // reach zero before canvas edge
  float edge = smoothstep(0.0,0.06,uv.x)*smoothstep(1.0,0.94,uv.x)*smoothstep(0.0,0.08,uv.y)*smoothstep(1.0,0.92,uv.y);
  g *= edge;
  if(uPaper > 0.5){
    vec3 col = mix(vec3(0.79,0.22,0.08), vec3(1.0,0.62,0.2), clamp(g,0.0,1.0));
    float a = clamp(g*0.85, 0.0, 0.9);
    gl_FragColor = vec4(col, a);
  } else {
    vec3 col = uInk * g;
    gl_FragColor = vec4(col * clamp(g,0.0,1.0), clamp(g,0.0,1.0));
  }
}`;
const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = vec2(p.x*0.5+0.5, p.y*0.5+0.5); gl_Position = vec4(p,0.,1.); }`;

export default function GpuFigure({ theme }: { theme: "dark" | "paper" }) {
  const [work, setWork] = useState(128);
  const [cpuMode, setCpuMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<number[]>(Array(CORES).fill(0.06));
  const targetRef = useRef<number[]>(Array(CORES).fill(0.06));
  const stateRef = useRef({ done: 0, running: false, work: 128, cpuMode: false });
  stateRef.current = { done, running, work, cpuMode };
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lanes = cpuMode ? 4 : CORES;
  const perLane = Math.ceil(work / lanes);
  const frameMs = cpuMode ? work * 3.2 : Math.ceil(work / CORES) * 0.9 + 1.1;
  const speedup = ((work * 3.2) / frameMs).toFixed(1);

  // progress loop (time-based, eased)
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = stateRef.current;
      if (s.running && !reduced) {
        const rate = s.cpuMode ? s.work / 2.4 : s.work / 0.9;
        const nd = Math.min(s.work, s.done + rate * dt);
        setDone(nd);
        if (nd >= s.work) setRunning(false);
      }
      // ease glow toward target (no pops)
      const active = new Array(CORES).fill(0.05);
      if (s.running || s.done > 0) {
        const per = Math.ceil(s.work / (s.cpuMode ? 4 : CORES));
        for (let i = 0; i < CORES; i++) {
          const assigned = s.cpuMode ? (i < 4 ? per : 0) : per;
          const finished = Math.max(0, s.done - 0) / (s.cpuMode ? 4 : CORES);
          const mine = Math.min(assigned, Math.max(0, assigned - Math.max(0, s.done / (s.cpuMode ? 4 : CORES) - 0)));
          void finished; void mine;
          const hasWork = s.cpuMode ? i < 4 && s.done < s.work : s.done < s.work;
          active[i] = hasWork ? 0.55 + 0.45 * Math.min(1, (s.work - s.done) / s.work + 0.3) : 0.06;
        }
      }
      targetRef.current = active;
      for (let i = 0; i < CORES; i++) {
        const g = glowRef.current[i];
        const want = targetRef.current[i];
        glowRef.current[i] = g + (want - g) * Math.min(1, dt * 4);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // WebGL layer
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { alpha: true, antialias: false });
    if (!gl) return;
    const mk = (t: number, src: string) => {
      const s = gl.createShader(t)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(pr, "uTime");
    const uPaper = gl.getUniformLocation(pr, "uPaper");
    const uInk = gl.getUniformLocation(pr, "uInk");
    const uPos = gl.getUniformLocation(pr, "uPos");
    const uGlow = gl.getUniformLocation(pr, "uGlow");
    const uvs = coreUV(0);
    void uvs;
    const positions = new Float32Array(CORES * 2);
    for (let i = 0; i < CORES; i++) {
      const [u, v] = coreUV(i);
      positions[i * 2] = u;
      positions[i * 2 + 1] = v;
    }
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver((e) => (visible = e[0].isIntersecting), { threshold: 0.05 });
    io.observe(cv);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onMq);
    const size = () => {
      const r = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.floor(cv.clientWidth * r));
      const h = Math.max(2, Math.floor(cv.clientWidth * (VH / VW) * r));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    const t0 = performance.now();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      size();
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(uTime, reduced ? 0 : t);
      gl.uniform1f(uPaper, theme === "paper" ? 1 : 0);
      gl.uniform3f(uInk, 1.0, 0.45, 0.15);
      gl.uniform2fv(uPos, positions);
      gl.uniform1fv(uGlow, new Float32Array(glowRef.current));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (reduced && (performance.now() - t0 > 500)) cancelAnimationFrame(raf);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mq.removeEventListener?.("change", onMq);
    };
  }, [theme, reduced]);

  const poke = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!stateRef.current.running) {
        setDone(0);
        setRunning(true);
      }
    }, 9000);
  };
  useEffect(() => {
    poke();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dispatch = () => {
    setDone(0);
    setRunning(true);
    poke();
  };
  const progress = work === 0 ? 0 : done / work;
  const headX = -78 + progress * 150;

  const readout = useMemo(() => {
    if (hover !== null) {
      const share = Math.ceil(work / (cpuMode ? 4 : CORES));
      return `core ${String(hover + 1).padStart(2, "0")} · ${hover < (cpuMode ? 4 : 16) ? share : 0} tris · ${frameMs.toFixed(1)} ms`;
    }
    return `${cpuMode ? 4 : 16} cores · ${Math.floor(done)}/${work} tris · ${frameMs.toFixed(1)} ms · ${speedup}×`;
  }, [hover, work, done, cpuMode, frameMs, speedup]);

  // static back/front geometry (back-to-front painter order)
  const screws: [number, number][] = [[-150, -78], [150, -78], [150, 78], [-150, 78]];
  return (
    <div>
      <div className="fx-stage" ref={wrapRef} role="img"
        aria-label="Tile-painting factory showing how a GPU shades many triangles in parallel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " ") { e.preventDefault(); running ? setRunning(false) : dispatch(); }
          if (e.key.toLowerCase() === "r") { setDone(0); setRunning(false); }
          if (e.key.toLowerCase() === "c") setCpuMode((v) => !v);
        }}>
        {/* BACK svg: what heat covers */}
        <svg className="iso-svg" viewBox={`0 0 ${VW} ${VH}`}>
          <ellipse className="iso-halo" cx={CX} cy={CY + 118} rx={250} ry={26} />
          {screws.slice(2).map(([x, y], k) => {
            const [sx, sy] = P(x, y, 12);
            return <circle key={k} cx={sx} cy={sy} r={3.2} fill="none" strokeWidth={0.6} className="iso-line" data-tone="lo" />;
          })}
          <Box x={-168} y={-92} w={300} d={184} z0={0} z1={12} edge="mid" />
          {screws.map(([x, y], k) => {
            const [sx, sy] = P(x, y, 12);
            return (
              <g key={k}>
                <circle cx={sx} cy={sy} r={4.4} fill="none" strokeWidth={0.6} className="iso-line" data-tone="lo" />
                <circle cx={sx} cy={sy} r={1.1} className="iso-dots" fill="currentColor" />
              </g>
            );
          })}
          {/* groove inset */}
          <path className="iso-line" data-tone="faint" d={d([P(-158, -82, 12), P(122, -82, 12), P(122, 82, 12), P(-158, 82, 12)])} />
          {/* VRAM shelf: 4 drawers, each as deep as its bytes */}
          {[-62, -40, -18, 4].map((dy, k) => (
            <g key={k}>
              <Box x={-152} y={dy} w={44} d={16} z0={12} z1={26} edge="mid" />
              <path className="iso-line" data-tone="faint" d={line([P(-148, dy + 16, 20), P(-112, dy + 16, 20)])} />
            </g>
          ))}
          {/* rails */}
          <Box x={-96} y={-64} w={200} d={5} z0={12} z1={15} />
          <Box x={-96} y={62} w={200} d={5} z0={12} z1={15} />
          {/* core plinths back rows */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const [x, y] = coreXY(i);
            return <Box key={i} x={x} y={y} w={22} d={18} z0={12} z1={16} />;
          })}
          {/* ruler strip + label plate */}
          <Box x={-60} y={76} w={150} d={7} z0={12} z1={13} />
          {Array.from({ length: 19 }).map((_, k) => {
            const x = -56 + k * 7.6;
            const [a, b] = [P(x, 79.5, 13), P(x, 79.5 + (k % 5 === 0 ? 4 : 2.4), 13)];
            return <path key={k} className="iso-line" data-tone={k % 5 === 0 ? "mid" : "lo"} d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} />;
          })}
          <Box x={96} y={70} w={46} d={14} z0={12} z1={13} />
          {/* framebuffer cabinet body */}
          <Box x={96} y={-72} w={52} d={56} z0={12} z1={44} edge="mid" />
        </svg>
        <canvas ref={canvasRef} className="fx-layer fx-gl" style={{ width: "100%", aspectRatio: `${VW}/${VH}` }} aria-hidden="true" />
        {/* FRONT svg: what covers heat */}
        <svg className="iso-svg" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
          {[8, 9, 10, 11, 12, 13, 14, 15].map((i) => {
            const [x, y] = coreXY(i);
            return <Box key={i} x={x} y={y} w={22} d={18} z0={12} z1={16} />;
          })}
          {/* pistons + lamps (lit subject) */}
          {Array.from({ length: CORES }).map((_, i) => {
            const [x, y] = coreXY(i);
            const on = running || done < work;
            const lit = on && (!cpuMode || i < 4);
            const [lx, ly] = P(x + 11, y + 9, 27);
            return (
              <g key={i} style={{ cursor: "pointer", pointerEvents: "visiblePainted" }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}
                onClick={() => setHover(i)} onKeyDown={(e) => e.key === "Enter" && setHover(i)}>
                <Cyl x={x + 11} y={y + 9} r={4.6} z0={16} z1={24} lit={lit && hover !== i ? false : lit} />
                <circle cx={lx} cy={ly - 7} r={hover === i ? 5 : 3.4}
                  fill={lit ? (theme === "paper" ? "#c93a3a" : "#ff5a1f") : "none"}
                  strokeWidth={0.7} className="iso-line" data-tone={lit ? "lit" : "mid"}
                  opacity={lit ? 1 : 0.7} />
              </g>
            );
          })}
          {/* dispatcher gantry carriage */}
          <g>
            <Box x={headX - 14} y={-64} w={28} d={131} z0={24} z1={29} edge="hi" lit />
            <Cyl x={headX} y={-58} r={5} z0={29} z1={35} lit />
            <Cyl x={headX} y={61} r={5} z0={29} z1={35} lit />
            <path className="iso-line" data-tone="lit" data-flow={running ? "" : undefined}
              d={line([P(headX, 0, 30), P(headX + 30, 0, 26)])} />
          </g>
          {/* triangles in flight */}
          {running && !reduced && Array.from({ length: 8 }).map((_, k) => {
            const t = (progress * 3 + k / 8) % 1;
            const fx = headX + 6 + t * 40;
            const fy = -30 + ((k * 37) % 90);
            const [sx, sy] = P(fx, fy, 28 - t * 4);
            return <path key={k} d={`M${sx} ${sy} l7 4 l-7 4 Z`} fill="none" strokeWidth={0.8} className="iso-line" data-tone="lit" opacity={0.9 - t * 0.5} />;
          })}
          {/* framebuffer screen face + pixels */}
          <g>
            {(() => {
              const a = P(96, -16, 44), b = P(148, -16, 44), c = P(148, -16, 20), e = P(96, -16, 20);
              return (
                <g>
                  <path className="iso-shade" data-shade="3" d={d([a, b, c, e])} />
                  <path className="iso-line" data-tone="hi" d={d([a, b, c, e])} />
                  {Array.from({ length: 24 }).map((_, k) => {
                    const col = k % 6, row = Math.floor(k / 6);
                    const px = 102 + col * 7, pz = 39 - row * 4.4;
                    const [sx, sy] = P(px, -15.4, pz);
                    const litPx = progress * 24 > k;
                    return <rect key={k} x={sx - 2.4} y={sy - 1.6} width={4.6} height={3}
                      fill={litPx ? (theme === "paper" ? "#1c1a17" : "#ffb066") : "none"}
                      strokeWidth={0.5} className="iso-line" data-tone={litPx ? "lit" : "faint"} />;
                  })}
                </g>
              );
            })()}
          </g>
          {/* end stops */}
          <Box x={-102} y={-66} w={5} d={137} z0={12} z1={20} />
          <Box x={104} y={-66} w={5} d={137} z0={12} z1={20} />
        </svg>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, alignItems: "center" }}>
        <label style={{ fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
          workload
          <input type="range" min={16} max={256} step={8} value={work} aria-label="Triangle workload"
            onChange={(e) => { setWork(Number(e.target.value)); setDone(0); setRunning(false); poke(); }} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{work} tris</span>
        </label>
        <button type="button" onClick={dispatch} aria-label="Dispatch work to GPU"
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: "var(--anatomy-card)", color: "var(--anatomy-strong)", cursor: "pointer" }}>
          {running ? "re-dispatch" : done > 0 && done >= work ? "run again" : "dispatch ▸"}
        </button>
        <button type="button" onClick={() => setRunning((v) => !v)} aria-label="Pause or resume"
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: "transparent", color: "inherit", cursor: "pointer" }}>
          {running ? "pause" : "resume"}
        </button>
        <button type="button" onClick={() => { setCpuMode((v) => !v); setDone(0); setRunning(true); }} aria-pressed={cpuMode}
          style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--anatomy-mid)", background: cpuMode ? "var(--anatomy-strong)" : "transparent", color: cpuMode ? "var(--anatomy-card)" : "inherit", cursor: "pointer" }}>
          {cpuMode ? "CPU: 4 cores" : "GPU: 16 cores"}
        </button>
        <span aria-live="polite" style={{ marginLeft: "auto", fontFamily: "var(--anatomy-mono)", fontSize: 11 }}>{readout}</span>
      </div>
    </div>
  );
}
