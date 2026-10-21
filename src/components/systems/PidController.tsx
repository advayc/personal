import { useEffect, useMemo, useState } from "react";

type Point = { t: number; y: number };
function response(kp: number, ki: number, kd: number, target: number): Point[] {
  const result: Point[] = [];
  let position = 0;
  let velocity = 0;
  let integral = 0;
  const dt = 0.025;
  for (let i = 0; i <= 180; i++) {
    const t = i * dt;
    const error = target - position;
    integral = Math.max(-1.5, Math.min(1.5, integral + error * dt));
    const effort = Math.max(-1.4, Math.min(1.4, kp * error + ki * integral - kd * velocity));
    const acceleration = 9 * effort - 3.8 * velocity;
    velocity += acceleration * dt;
    position += velocity * dt;
    result.push({ t, y: position });
  }
  return result;
}
const plotX = (t: number) => 48 + (t / 4.5) * 660;
const plotY = (v: number) => 169 - (v / 1.5) * 132;

export function PidController() {
  const [kp, setKp] = useState(1.8);
  const [ki, setKi] = useState(0.45);
  const [kd, setKd] = useState(1.1);
  const [target, setTarget] = useState(1);
  const [running, setRunning] = useState(true);
  const [time, setTime] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!running || reduced) return;
    const timer = window.setInterval(() => setTime((value) => value + 0.04), 40);
    return () => window.clearInterval(timer);
  }, [running, reduced]);
  const series = useMemo(() => response(kp, ki, kd, target), [kp, ki, kd, target]);
  const path = series.map((point, i) => (i ? "L" : "M") + plotX(point.t).toFixed(1) + " " + plotY(point.y).toFixed(1)).join(" ");
  const sample = series[Math.min(series.length - 1, Math.floor((time % 4.5) / 4.5 * (series.length - 1)))];
  const rotorAngle = running && !reduced ? time * (4 + kp * 5) : 0;
  const scale = (v: number) => Math.max(0, Math.min(100, Math.round(v * 100)));
  return (
    <div className="system-instrument pid-study">
      <svg className="iso-svg pid-mechanism" viewBox="0 0 760 310" role="img" aria-label="Animated closed-loop PID system: setpoint, controller, motor, encoder feedback">
        <defs>
          <linearGradient id="pid-wire" x1="0" x2="1">
            <stop offset="0%" stopColor="#52d8c8" /><stop offset="50%" stopColor="#6c8cff" /><stop offset="100%" stopColor="#ffa04a" />
          </linearGradient>
          <filter id="pid-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M82 236l78-43h466l76 43-78 44H158z" className="anatomy-platform" />
        <path d="M126 225H270M416 225H512" className="pid-signal pid-forward" />
        <path d="M574 245V277H191V247" className="pid-signal pid-feedback" />
        <circle r="5" className="pid-pulse" style={{ offsetPath: "path('M126 225H270M416 225H512')" }} />
        <g className="pid-block">
          <polygon points="74,130 106,108 239,108 207,130" className="pid-top" />
          <polygon points="207,130 239,108 239,202 207,224" className="pid-side" />
          <rect x="74" y="130" width="133" height="94" rx="4" />
          <text x="140" y="164" textAnchor="middle">PID</text>
          <text x="140" y="184" textAnchor="middle" className="pid-label">control board</text>
          <circle cx="96" cy="205" r="4" className="pid-led" />
          <circle cx="109" cy="205" r="4" className="pid-led pid-led-2" />
        </g>
        <g className="pid-block pid-target-block">
          <polygon points="278,153 304,135 400,135 374,153" />
          <polygon points="374,153 400,135 400,194 374,212" className="pid-side" />
          <rect x="278" y="153" width="96" height="59" rx="4" />
          <text x="326" y="179" textAnchor="middle">setpoint</text>
          <text x="326" y="196" textAnchor="middle" className="pid-label">{target.toFixed(1)} units</text>
        </g>
        <g className="pid-motor">
          <ellipse cx="558" cy="187" rx="47" ry="26" />
          <path d="M511 187v41c0 14 21 25 47 25s47-11 47-25v-41" />
          <ellipse cx="558" cy="187" rx="47" ry="26" />
          <g transform={"rotate(" + rotorAngle.toFixed(1) + " 558 187)"}>
            <path d="M558 169v36M540 187h36M545 174l26 26M571 174l-26 26" />
            <circle cx="558" cy="187" r="8" />
          </g>
          <text x="558" y="276" textAnchor="middle" className="pid-label">motor + load</text>
        </g>
        <g className="pid-encoder">
          <circle cx="650" cy="181" r="21" /><circle cx="650" cy="181" r="12" />
          <path d="M650 166v30M635 181h30" />
          <text x="650" y="221" textAnchor="middle" className="pid-label">encoder</text>
        </g>
        <text x="122" y="96" className="pid-caption">error × P + accumulated I − rate × D</text>
        <text x="455" y="211" className="pid-wire-label">control effort</text>
        <text x="322" y="270" className="pid-wire-label">measured position returns to the controller</text>
      </svg>
      <svg className="pid-chart" viewBox="0 0 760 220" role="img" aria-label="Live position response against the target line">
        <path className="pid-grid" d="M48 36H708M48 80H708M48 124H708M48 168H708M48 36V169" />
        <path className="pid-target-line" d={"M48 " + plotY(target) + "H708"} />
        <path className="pid-response-line" d={path} />
        <circle className="pid-chart-head" cx={plotX(sample.t)} cy={plotY(sample.y)} r="5" />
        <text x="48" y="199">0 s</text><text x="686" y="199">4.5 s</text>
        <text x="52" y="26">position</text><text x="639" y={plotY(target) - 8}>target</text>
      </svg>
      <div className="instrument-controls pid-controls">
        <label>Kp <input aria-label="PID proportional gain" type="range" min="0" max="4" step="0.1" value={kp} onChange={(e) => setKp(+e.target.value)} /><output>{kp.toFixed(1)}</output></label>
        <label>Ki <input aria-label="PID integral gain" type="range" min="0" max="1.5" step="0.05" value={ki} onChange={(e) => setKi(+e.target.value)} /><output>{ki.toFixed(2)}</output></label>
        <label>Kd <input aria-label="PID derivative gain" type="range" min="0" max="2.5" step="0.1" value={kd} onChange={(e) => setKd(+e.target.value)} /><output>{kd.toFixed(1)}</output></label>
        <label>target <input aria-label="PID target position" type="range" min="0.5" max="1.4" step="0.1" value={target} onChange={(e) => setTarget(+e.target.value)} /><output>{target.toFixed(1)}</output></label>
        <button onClick={() => setRunning((value) => !value)}>{running ? "pause" : "run"}</button>
        <button onClick={() => setTime(0)}>restart</button>
      </div>
      <output className="pid-readout">current position {sample.y.toFixed(2)} · error {(target - sample.y).toFixed(2)} · control effort {scale(Math.min(1, Math.abs(target - sample.y) * kp))}%</output>
      <p className="mechanism-note">A small second-order motor model for exploring the three terms; the response is illustrative, not a tuned real plant.</p>
    </div>
  );
}
