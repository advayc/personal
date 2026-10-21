import { useEffect, useMemo, useState } from "react";

type Sample = {
  actual: number;
  observed: number;
  prediction: number;
  estimate: number;
  variance: number;
  gain: number;
  velocity: number;
};

function sampleAt(k: number, sensorSigma: number) {
  const actual = 0.5 + 0.27 * Math.sin(k * 0.045) + 0.1 * Math.sin(k * 0.017 + 1.2);
  const noise = Math.sin(k * 2.399) * 0.72 + Math.cos(k * 0.713) * 0.28;
  const observed = Math.max(0.04, Math.min(0.96, actual + (noise * sensorSigma) / 100));
  return { actual, observed };
}

function track(tick: number, sensorSigma: number, processNoise: number): Sample[] {
  const first = tick - 79;
  let position = 0.5;
  let velocity = 0;
  let p00 = 0.25;
  let p01 = 0;
  let p10 = 0;
  let p11 = 0.03;
  const q = processNoise * processNoise * 0.000012;
  const samples: Sample[] = [];
  for (let k = first; k <= tick; k++) {
    const sample = sampleAt(k, sensorSigma);
    const predictedPosition = position + velocity;
    const predictedVelocity = velocity;
    const a00 = p00 + p01 + p10 + p11 + q;
    const a01 = p01 + p11;
    const a10 = p10 + p11;
    const a11 = p11 + q;
    const measurementVariance = Math.pow(sensorSigma / 100, 2);
    const innovationVariance = a00 + measurementVariance;
    const gain0 = a00 / innovationVariance;
    const gain1 = a10 / innovationVariance;
    const residual = sample.observed - predictedPosition;
    position = predictedPosition + gain0 * residual;
    velocity = predictedVelocity + gain1 * residual;
    p00 = (1 - gain0) * a00;
    p01 = (1 - gain0) * a01;
    p10 = a10 - gain1 * a00;
    p11 = a11 - gain1 * a01;
    samples.push({
      ...sample,
      prediction: predictedPosition,
      estimate: position,
      variance: Math.max(0, p00),
      gain: gain0,
      velocity,
    });
  }
  return samples;
}

const xAt = (i: number) => 43 + (i / 79) * 670;
const yAt = (v: number) => 162 - v * 130;
const trackX = (value: number) => 102 + value * 454;
const ticks = Array.from({ length: 24 }, (_, i) => i);

export function KalmanFilter() {
  const [noise, setNoise] = useState(8);
  const [process, setProcess] = useState(1.3);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);
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
    const timer = window.setInterval(() => setTick((value) => value + 1), 70);
    return () => window.clearInterval(timer);
  }, [running, reduced]);

  const data = useMemo(() => track(tick, noise, process), [tick, noise, process]);
  const actualLine = data.map((item, i) => (i ? "L" : "M") + xAt(i) + " " + yAt(item.actual)).join(" ");
  const estimateLine = data.map((item, i) => (i ? "L" : "M") + xAt(i) + " " + yAt(item.estimate)).join(" ");
  const upperBand = data.map((item, i) => (i ? "L" : "M") + xAt(i) + " " + yAt(Math.min(1, item.estimate + Math.sqrt(item.variance)))).join(" ");
  const lowerBand = [...data].reverse().map((item, i) => "L" + xAt(79 - i) + " " + yAt(Math.max(0, item.estimate - Math.sqrt(item.variance)))).join(" ");
  const last = data[data.length - 1];
  const xActual = trackX(last.actual);
  const xMeasurement = trackX(last.observed);
  const xPrediction = trackX(last.prediction);
  const xEstimate = trackX(last.estimate);
  const sigma = Math.sqrt(last.variance) * 100;
  const uncertaintyWidth = Math.max(11, Math.min(76, sigma * 1.8));
  const gainAngle = -125 + last.gain * 250;
  const currentMeasurementY = yAt(last.observed);
  const currentEstimateY = yAt(last.estimate);
  const sampleCount = tick + 1;

  return (
    <div className="system-instrument kalman-study">
      <svg
        className="iso-svg kalman-mechanism"
        viewBox="0 0 760 340"
        role="img"
        aria-label={`Position tracking apparatus: target ${Math.round(last.actual * 100)} percent, sensor reading ${Math.round(last.observed * 100)} percent, filtered estimate ${Math.round(last.estimate * 100)} percent`}
      >
        <defs>
          <linearGradient id="kalman-signal" x1="0" x2="1">
            <stop offset="0" stopColor="#ffbd61" />
            <stop offset="1" stopColor="#b998ff" />
          </linearGradient>
          <linearGradient id="kalman-glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d8f4ff" stopOpacity=".25" />
            <stop offset="1" stopColor="#72b8d9" stopOpacity=".04" />
          </linearGradient>
        </defs>

        {/* Machined base, isolation feet, and two aligned measurement rails. */}
        <path d="M40 264l48-25h580l52 25-51 31H89z" className="anatomy-platform kalman-plinth" />
        <path d="M79 292v9m22-1v-7m550 7v-7m24 7v-9" className="kalman-foot" />
        <path d="M82 186h501m-501 11h501M83 250h501m-501 11h501" className="kalman-rail" />
        <path d="M91 181h482v4H91zm0 64h482v4H91z" className="kalman-rail-crown" />
        {ticks.map((i) => {
          const x = 98 + i * 20;
          const major = i % 4 === 0;
          return (
            <g key={i}>
              <path d={`M${x} 205v${major ? 10 : 5}M${x} 270v${major ? 10 : 5}`} className={major ? "kalman-scale-major" : "kalman-scale-tick"} />
              {major && <circle cx={x} cy="184" r="1.4" className="kalman-rail-rivet" />}
            </g>
          );
        })}
        <path d="M86 228h501" className="kalman-base-seam" />
        {[92, 119, 563, 590, 655, 701].map((x) => (
          <g key={x}>
            <circle cx={x} cy="279" r="2.8" className="kalman-fastener" />
            <path d={`M${x - 1.4} 279h2.8`} className="kalman-screw-slot" />
          </g>
        ))}

        {/* Real target carriage on the upper rail. */}
        <g className="kalman-cart" transform={`translate(${xActual - 330} 0)`}>
          <path d="M294 154l13-12h46l13 12v28h-72z" className="kalman-cart-shell" />
          <path d="M300 155h60v17h-60z" className="kalman-cart-window" />
          <path d="M306 159h20v9h-20zm26 0h25v9h-25z" className="kalman-cart-glass" />
          <path d="M300 176h60" className="kalman-cart-seam" />
          {[302, 316, 358].map((x) => <circle key={x} cx={x} cy="149" r="1.4" className="kalman-fastener" />)}
          <path d="M307 142v-8h33v8" className="kalman-target-mast" />
          <circle cx="323.5" cy="132" r="4" className="kalman-target" />
          <circle cx="323.5" cy="132" r="1.3" className="kalman-target-core" />
          <circle cx="306" cy="190" r="7" className="kalman-wheel" />
          <circle cx="356" cy="190" r="7" className="kalman-wheel" />
          <circle cx="306" cy="190" r="2" className="kalman-wheel-hub" />
          <circle cx="356" cy="190" r="2" className="kalman-wheel-hub" />
        </g>

        {/* A second follower shows the filtered position and its confidence interval. */}
        <rect x={xEstimate - uncertaintyWidth / 2} y="239" width={uncertaintyWidth} height="25" rx="5" className="kalman-confidence" />
        <line x1={xPrediction} x2={xPrediction} y1="227" y2="245" className="kalman-prediction-marker" />
        <g className="kalman-estimate-carriage" transform={`translate(${xEstimate - 330} 0)`}>
          <path d="M309 227l8-8h26l8 8v20h-42z" className="kalman-estimate-shell" />
          <path d="M316 230h28v8h-28z" className="kalman-estimate-glass" />
          <circle cx="318" cy="251" r="5.2" className="kalman-estimate-wheel" />
          <circle cx="342" cy="251" r="5.2" className="kalman-estimate-wheel" />
          <circle cx="318" cy="251" r="1.4" className="kalman-wheel-hub" />
          <circle cx="342" cy="251" r="1.4" className="kalman-wheel-hub" />
        </g>

        {/* Optical gauge gantry: feet, twin uprights, bridge, sensor shell, lens, and beam. */}
        <path d="M354 145V76h12v69m39 0V76h12v69m-69-74h88v12h-88z" className="kalman-gantry" />
        <path d="M351 145h18m33 0h18M354 80h63" className="kalman-gantry-seam" />
        {[358, 403].map((x) => (
          <g key={x}>
            <rect x={x - 7} y="137" width="14" height="8" rx="2" className="kalman-gantry-foot" />
            <circle cx={x} cy="141" r="1.2" className="kalman-fastener" />
            <circle cx={x + 5} cy="81" r="1.3" className="kalman-fastener" />
          </g>
        ))}
        <rect x="366" y="45" width="38" height="35" rx="5" className="kalman-sensor-body" />
        <path d="M371 50h28v4h-28zm0 25h28v2h-28z" className="kalman-sensor-ridge" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${374 + i * 6} 46v4`} className="kalman-sensor-fins" />)}
        <circle cx="385" cy="64" r="11" className="kalman-lens-ring" />
        <circle cx="385" cy="64" r="7" className="kalman-lens" />
        <circle cx="385" cy="64" r="3" className="kalman-lens-core" />
        <path d={`M385 76Q${(385 + xMeasurement) / 2} 116 ${xMeasurement} 139`} className="kalman-ray" />
        <circle cx={xMeasurement} cy="139" r="8" className="kalman-measurement-halo" />
        <circle cx={xMeasurement} cy="139" r="3.5" className="kalman-measurement" />
        <line x1={xMeasurement} x2={xMeasurement} y1="148" y2="180" className="kalman-measurement-line" />
        <line x1={xActual} x2={xActual} y1="148" y2="180" className="kalman-actual-marker" />

        {/* Filter instrument: prediction rotor, gain meter, covariance window, and wired ports. */}
        <path d="M422 80h126v-15h28v15h11" className="kalman-signal-wire" />
        <circle cx="422" cy="80" r="3" className="kalman-terminal" />
        <circle cx="587" cy="80" r="3" className="kalman-terminal" />
        <rect x="587" y="51" width="145" height="132" rx="7" className="kalman-estimator-shell" />
        <path d="M595 60h129v9H595z" className="kalman-estimator-top" />
        {[600, 719].map((x) => <circle key={x} cx={x} cy="57" r="1.5" className="kalman-fastener" />)}
        <text x="603" y="66" className="kalman-module-label">STATE ESTIMATOR</text>
        <rect x="599" y="76" width="59" height="55" rx="4" className="kalman-gauge-well" />
        <circle cx="628.5" cy="103.5" r="20" className="kalman-gauge-ring" />
        <circle cx="628.5" cy="103.5" r="15" className="kalman-gauge-face" />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (-135 + i * 33.75) * Math.PI / 180;
          return <path key={i} d={`M${628.5 + Math.cos(a) * 16} ${103.5 + Math.sin(a) * 16}L${628.5 + Math.cos(a) * 18.5} ${103.5 + Math.sin(a) * 18.5}`} className="kalman-gauge-tick" />;
        })}
        <path d="M628.5 103.5h14" className="kalman-gain-needle" transform={`rotate(${gainAngle} 628.5 103.5)`} />
        <circle cx="628.5" cy="103.5" r="2.5" className="kalman-gauge-pin" />
        <text x="629" y="127" textAnchor="middle" className="kalman-micro-label">GAIN K</text>
        <rect x="666" y="77" width="56" height="24" rx="2" className="kalman-display" />
        <path d="M672 84h18m-18 5h11" className="kalman-display-ink" />
        <text x="711" y="92" textAnchor="end" className="kalman-display-value">{Math.round(last.prediction * 100)}%</text>
        <text x="672" y="112" className="kalman-micro-label">PREDICTED X</text>
        <rect x="666" y="117" width="56" height="14" rx="2" className="kalman-covariance-track" />
        <rect x="667" y="118" width={Math.max(4, Math.min(54, sigma * 1.3))} height="12" rx="1.5" className="kalman-covariance-fill" />
        <text x="672" y="143" className="kalman-micro-label">POSITION UNCERTAINTY</text>
        <path d="M600 148h118m-118 9h85" className="kalman-board-trace" />
        {[603, 621, 639, 657, 675, 693, 711].map((x, i) => (
          <g key={x}>
            <rect x={x} y="166" width="7" height="7" rx="1" className="kalman-terminal-pad" />
            <circle cx={x + 3.5} cy="169.5" r="1.1" className={i % 2 ? "kalman-led" : "kalman-led muted"} />
          </g>
        ))}
        <path d={`M656 131V205H${xEstimate}v14`} className="kalman-output-wire" />
        <circle cx="656" cy="131" r="2.6" className="kalman-terminal" />

        <text x="93" y="174" className="kalman-caption">measured target</text>
        <text x="450" y="174" className="kalman-caption">true position</text>
        <text x="91" y="241" className="kalman-caption">filtered follower</text>
        <text x={xPrediction + 5} y="224" className="kalman-caption">prediction</text>
        <text x="601" y="201" className="kalman-caption">innovation → update</text>
        <path d={`M${xMeasurement} 151v-6m${xActual - xMeasurement} 0v6`} className="kalman-residual-bracket" />
      </svg>

      <svg className="kalman-chart" viewBox="0 0 760 210" role="img" aria-label="Live position plot with an uncertainty band, noisy sensor samples, and the filtered estimate">
        <path className="kalman-grid" d="M43 32H713M43 75H713M43 118H713M43 162H713M43 32V162" />
        <path d={`${upperBand} ${lowerBand}Z`} className="kalman-uncertainty-band" />
        <path className="kalman-actual-line" d={actualLine} />
        <path className="kalman-estimate-line" d={estimateLine} />
        {data.filter((_, i) => i % 5 === 0).map((item, i) => {
          const index = i * 5;
          return <circle key={index} className="kalman-observation-dot" cx={xAt(index)} cy={yAt(item.observed)} r="2.8" />;
        })}
        <line x1="43" x2="713" y1={currentMeasurementY} y2={currentMeasurementY} className="kalman-current-measure" />
        <circle cx="713" cy={currentEstimateY} r="5" className="kalman-current-estimate" />
        <text x="44" y="190">earlier</text><text x="673" y="190">now</text>
        <text x="58" y="22" className="kalman-legend true">true path</text>
        <text x="150" y="22" className="kalman-legend measured">sensor readings</text>
        <text x="300" y="22" className="kalman-legend filtered">estimate + uncertainty</text>
      </svg>

      <div className="instrument-controls kalman-controls">
        <label>sensor noise <input aria-label="Kalman sensor noise" type="range" min="1" max="18" step="1" value={noise} onChange={(event) => setNoise(+event.target.value)} /><output>{noise}%</output></label>
        <label>motion uncertainty <input aria-label="Kalman motion uncertainty" type="range" min="0.2" max="3" step="0.1" value={process} onChange={(event) => setProcess(+event.target.value)} /><output>{process.toFixed(1)}</output></label>
        <button aria-pressed={running && !reduced} disabled={reduced} onClick={() => setRunning((value) => !value)}>{reduced ? "motion reduced" : running ? "pause" : "run"}</button>
        <button onClick={() => setTick(0)}>restart</button>
      </div>
      <output className="kalman-readout">
        reading {Math.round(last.observed * 100)}% · prediction {Math.round(last.prediction * 100)}% · estimate {Math.round(last.estimate * 100)}% · gain {last.gain.toFixed(2)} · ±{sigma.toFixed(1)}% · frame {sampleCount}
      </output>
      <p className="mechanism-note">
        The rig predicts the cart’s next position, compares that guess with the
        optical reading, then moves a second carriage to the updated estimate.
        The violet band shows how uncertain that estimate is.
      </p>
    </div>
  );
}
