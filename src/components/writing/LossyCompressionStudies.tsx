import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { FiPause, FiPlay } from "react-icons/fi";

type StudyProps = { kind: string };

const jpegResults = [
  { quality: 95, size: "114 KB", ratio: "4.2:1", psnr: 41.24, ssim: 0.971, image: "q95" },
  { quality: 75, size: "44 KB", ratio: "10.9:1", psnr: 35.75, ssim: 0.936, image: "q75" },
  { quality: 50, size: "30 KB", ratio: "16.1:1", psnr: 33.53, ssim: 0.912, image: "q50" },
  { quality: 30, size: "22 KB", ratio: "21.4:1", psnr: 31.96, ssim: 0.890, image: "q30" },
  { quality: 10, size: "12 KB", ratio: "38.9:1", psnr: 28.27, ssim: 0.813, image: "q10" },
];

const asset = (filename: string) => `/writing/lossy-compression/assets/${filename}`;

function StudyFrame({ title, hint, children, className = "" }: {
  title: string;
  hint: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`compression-study ${className}`} aria-label={title}>
      <div className="compression-study-heading">
        <h3>{title}</h3>
        <span>{hint}</span>
      </div>
      {children}
    </section>
  );
}

function StudyCaption({ children }: { children: React.ReactNode }) {
  return <p className="study-caption">{children}</p>;
}

function JpegComparison({ overview = false }: { overview?: boolean }) {
  const [quality, setQuality] = useState(95);
  const [split, setSplit] = useState(50);
  const [zoom, setZoom] = useState(1);
  const result = jpegResults.find((item) => item.quality === quality) || jpegResults[0];
  return (
    <StudyFrame title="JPEG compression, side by side" hint={overview ? "overview · explore image quality" : "section 3.1 · drag the divider"}>
      <div className="jpeg-comparison" style={{ "--jpeg-split": `${split}%`, "--jpeg-zoom": zoom } as React.CSSProperties}>
        <img src={asset(`kodak-jpeg-${result.image}.png`)} alt={`Kodak aircraft crop compressed to JPEG quality ${quality}`} />
        <div className="jpeg-original-layer">
          <img src={asset("kodak-original-crop.png")} alt="Original Kodak aircraft crop" />
        </div>
        <span className="jpeg-divider" aria-hidden="true"><i /></span>
        <span className="jpeg-image-label jpeg-label-original">Original</span>
        <span className="jpeg-image-label jpeg-label-compressed">JPEG {quality}</span>
        <input
          className="jpeg-split-range"
          aria-label="Move the before and after divider"
          type="range"
          min="5"
          max="95"
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
        />
      </div>
      <div className="jpeg-qualities" role="group" aria-label="JPEG quality">
        {jpegResults.map((item) => (
          <button key={item.quality} type="button" aria-pressed={quality === item.quality} onClick={() => setQuality(item.quality)}>
            Q{item.quality}
          </button>
        ))}
      </div>
      <div className="jpeg-zoom-controls" role="group" aria-label="Image zoom">
        <span>zoom</span>
        {[1, 1.5, 2].map((value) => <button key={value} type="button" aria-pressed={zoom === value} onClick={() => setZoom(value)}>{value}×</button>)}
      </div>
      <dl className="jpeg-readout">
        <div><dt>file size</dt><dd>{result.size}</dd></div>
        <div><dt>compression</dt><dd>{result.ratio}</dd></div>
        <div><dt>PSNR</dt><dd>{result.psnr} dB</dd></div>
        <div><dt>SSIM</dt><dd>{result.ssim.toFixed(3)}</dd></div>
      </dl>
      <StudyCaption>{overview ? "Figure 1: Effect of increasing JPEG lossy compression on image quality and file size (Fassina 2020). Compare each setting with the original." : "Figures 3–7. Drag across the same aircraft detail to compare the original with Q95, Q75, Q50, Q30, or Q10, then zoom in to inspect artifacts."}</StudyCaption>
    </StudyFrame>
  );
}

function ArtifactZoomStudy() {
  const [quality, setQuality] = useState(95);
  const [zoom, setZoom] = useState(2);
  const result = jpegResults.find((item) => item.quality === quality) || jpegResults[0];
  return (
    <StudyFrame title="Inspect JPEG artifacts up close" hint="same 150 × 150 crop · choose a quality">
      <div className="artifact-zoom-pair" style={{ "--artifact-zoom": zoom } as React.CSSProperties}>
        <figure>
          <img src={asset("kodak-original-crop.png")} alt="Original 150 by 150 pixel crop from Kodak Image 20" />
          <figcaption>Original crop</figcaption>
        </figure>
        <figure>
          <img src={asset(`kodak-jpeg-${result.image}.png`)} alt={`Same crop encoded at JPEG quality ${quality}`} />
          <figcaption>JPEG Q{quality}</figcaption>
        </figure>
      </div>
      <div className="jpeg-qualities" role="group" aria-label="Choose the JPEG crop quality">
        {jpegResults.map((item) => <button key={item.quality} type="button" aria-pressed={quality === item.quality} onClick={() => setQuality(item.quality)}>Q{item.quality}</button>)}
      </div>
      <div className="jpeg-zoom-controls" role="group" aria-label="Magnification">
        <span>magnification</span>
        {[1, 2, 3].map((value) => <button key={value} type="button" aria-pressed={zoom === value} onClick={() => setZoom(value)}>{value}×</button>)}
      </div>
      <p className="study-readout" aria-live="polite">Q{quality} · {result.size} · {result.psnr} dB PSNR · {result.ssim.toFixed(3)} SSIM</p>
      <StudyCaption>Figure 7a. A close view of the same source crop at original resolution and JPEG quality {quality}. The crop uses pixels x=200–349 and y=150–299.</StudyCaption>
    </StudyFrame>
  );
}

function JpegFidelityStudy() {
  const [metric, setMetric] = useState<"psnr" | "ssim">("psnr");
  const [active, setActive] = useState(2);
  const values = jpegResults.slice().reverse();
  const min = metric === "psnr" ? 20 : 0.7;
  const max = metric === "psnr" ? 37 : 1;
  const points = values.map((item, index) => ({
    item,
    x: 62 + index * 105,
    y: 178 - ((((metric === "psnr" ? item.psnr : item.ssim) - min) / (max - min)) * 130),
  }));
  const selected = points[active]?.item || values[2];
  return (
    <StudyFrame title="How image fidelity changes with JPEG quality" hint="select a metric and point">
      <div className="quality-tabs" role="group" aria-label="Image quality metric">
        <button type="button" aria-pressed={metric === "psnr"} onClick={() => setMetric("psnr")}>PSNR</button>
        <button type="button" aria-pressed={metric === "ssim"} onClick={() => setMetric("ssim")}>SSIM</button>
      </div>
      <svg className="fidelity-chart" viewBox="0 0 560 220" role="img" aria-label={`Interactive JPEG quality versus ${metric.toUpperCase()} chart`}>
        {[48, 82, 116, 150, 184].map((y) => <line key={y} x1="54" x2="516" y1={y} y2={y} className="study-grid-line" />)}
        <line x1="54" x2="516" y1="184" y2="184" className="quality-axis" />
        <line x1="54" x2="54" y1="34" y2="184" className="quality-axis" />
        <text x="15" y="110" textAnchor="middle" transform="rotate(-90 15 110)" className="quality-axis-label">{metric === "psnr" ? "PSNR · dB" : "SSIM · 0–1"}</text>
        <path d={points.map(({ x, y }, index) => `${index ? "L" : "M"} ${x} ${y}`).join(" ")} className="quality-line" />
        {points.map(({ item, x, y }, index) => <g key={item.quality} tabIndex={0} role="button" aria-label={`JPEG quality ${item.quality}: ${metric === "psnr" ? `${item.psnr} dB PSNR` : `${item.ssim.toFixed(3)} SSIM`}`} onClick={() => setActive(index)} onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setActive(index); }} className={`quality-point ${active === index ? "is-active" : ""}`}>
          <circle cx={x} cy={y} r="13" className="quality-hit-area" />
          <circle cx={x} cy={y} r="5" className="quality-dot" />
          <text x={x} y="203" textAnchor="middle" className="quality-point-label">Q{item.quality}</text>
        </g>)}
      </svg>
      <div className="quality-readout"><span className="quality-readout-label">Q{selected.quality}</span><span>{selected.size}</span><span>{selected.ratio} compression</span><strong>{selected.psnr} dB PSNR</strong><strong>{selected.ssim.toFixed(3)} SSIM</strong></div>
      <StudyCaption>Figure 8a. Both metrics improve as JPEG quality rises. Hover, focus, or select a point to compare the measured quality with the file-size cost.</StudyCaption>
    </StudyFrame>
  );
}

function CompressionPipeline() {
  const [step, setStep] = useState(0);
  const stages = [
    { title: "Transform", label: "pixels → frequencies", detail: "Group image or audio samples by spatial and temporal frequency." },
    { title: "Quantize", label: "fine detail → fewer values", detail: "Round less perceptible coefficients more aggressively to reduce data." },
    { title: "Encode", label: "values → compact bits", detail: "Store repeated symbols efficiently without further changing the signal." },
  ];
  return (
    <StudyFrame title="Three steps in lossy compression" hint="select a stage to follow the signal">
      <div className="pipeline-flow" role="group" aria-label="Compression pipeline">
        {stages.map((stage, index) => <button key={stage.title} type="button" aria-pressed={step === index} onClick={() => setStep(index)}><span className="pipeline-number">0{index + 1}</span><strong>{stage.title}</strong><small>{stage.label}</small></button>)}
      </div>
      <p className="study-readout" aria-live="polite">{stages[step].detail}</p>
      <StudyCaption>Both formats follow the same broad path, with a different frequency transform and perceptual model.</StudyCaption>
    </StudyFrame>
  );
}

function QuantizationStudy() {
  const [strength, setStrength] = useState(3);
  const sourceValues = Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    return Math.round(38 / (1 + row + col) * Math.sin((row + 1) * (col + 2)));
  });
  const quantizedValues = sourceValues.map((value) => Math.round(value / strength) * strength);
  const zeroed = quantizedValues.filter((value) => value === 0).length;
  return (
    <StudyFrame title="Quantization removes precision" hint="adjust the quantization step">
      <figure className="quant-matrix">
        <figcaption><strong>Quantized coefficients</strong><span>step {strength}</span></figcaption>
        <div className="quant-grid" role="img" aria-label={`8 by 8 coefficient heatmap; quantization step ${strength}; ${zeroed} of 64 values round to zero`}>
          {quantizedValues.map((value, index) => {
            const mix = Math.round(Math.min(1, Math.abs(value) / 34) * 50 + 8);
            const direction = value > 0 ? "positive" : value < 0 ? "negative" : "zero";
            return <span
              key={index}
              className={`quant-cell is-${direction}`}
              style={{ "--coefficient-mix": `${mix}%` } as React.CSSProperties}
              title={`Row ${Math.floor(index / 8) + 1}, column ${(index % 8) + 1}: ${value}`}
              aria-hidden="true"
            >{value || ""}<i /></span>;
          })}
        </div>
        <div className="quant-frequency-labels"><span>low frequency</span><span>high frequency</span></div>
      </figure>
      <div className="quantization-summary" aria-live="polite">
        <span><i className="quant-legend-positive" />positive</span>
        <span><i className="quant-legend-negative" />negative</span>
        <strong>{zeroed} / 64 round to zero</strong>
      </div>
      <label className="study-range-label"><span><span>quantization step</span><output>{strength}</output></span><input type="range" min="1" max="12" value={strength} onChange={(event) => setStrength(Number(event.target.value))} /></label>
      <StudyCaption>Increasing the step rounds more coefficients to the same values, saving bits while removing subtle detail.</StudyCaption>
    </StudyFrame>
  );
}

function PerceptionStudy() {
  const [medium, setMedium] = useState<"image" | "audio">("image");
  const [sensitivity, setSensitivity] = useState(55);
  const curve = Array.from({ length: 80 }, (_, index) => {
    const x = index / 79;
    const baseline = medium === "image" ? .2 + .63 * Math.exp(-Math.pow((x - .24) / .25, 2)) : .18 + .62 * Math.exp(-Math.pow((x - .55) / .27, 2));
    const threshold = .14 + (sensitivity / 100) * .5 * Math.exp(-Math.pow((x - .48) / .25, 2));
    return { x: 12 + x * 416, y: baseline * 112, t: threshold * 112 };
  });
  const path = (key: "y" | "t") => curve.map(({ x, [key]: y }, index) => `${index ? "L" : "M"}${x.toFixed(1)},${(132 - y).toFixed(1)}`).join(" ");
  return (
    <StudyFrame title="Perceptual threshold" hint="move the sensitivity control">
      <div className="perception-controls" role="group" aria-label="Choose signal type">
        <button type="button" aria-pressed={medium === "image"} onClick={() => setMedium("image")}>Image detail</button>
        <button type="button" aria-pressed={medium === "audio"} onClick={() => setMedium("audio")}>Audio frequency</button>
      </div>
      <svg className="perception-chart" viewBox="0 0 440 160" role="img" aria-label={`${medium} detail energy and adjustable perceptual threshold`}>
        {[36, 68, 100, 132].map((y) => <line key={y} x1="12" x2="428" y1={y} y2={y} className="study-grid-line" />)}
        <path d={path("y")} className="perception-signal" />
        <path d={path("t")} className="perception-threshold" />
        <text x="12" y="152">low frequency</text><text x="428" y="152" textAnchor="end">high frequency</text>
      </svg>
      <label className="study-range-label"><span><span>masking strength</span><output>{sensitivity}%</output></span><input type="range" min="0" max="100" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} /></label>
      <StudyCaption>Compression can discard signal energy that sits below the perceptual threshold for a given medium.</StudyCaption>
    </StudyFrame>
  );
}

function TradeoffStudy() {
  const [ratio, setRatio] = useState(10);
  const saved = Math.round((1 - 1 / ratio) * 100);
  const quality = Math.round(100 - Math.max(0, ratio - 1) * 2.6);
  return (
    <StudyFrame title="The compression trade-off" hint="move along the size–quality curve">
      <div className="tradeoff-readouts"><div><span>space saved</span><strong>{saved}%</strong></div><div><span>illustrative quality</span><strong>{quality}%</strong></div></div>
      <div className="tradeoff-track"><span className="tradeoff-space" style={{ width: `${saved}%` }} /><span className="tradeoff-marker" style={{ left: `${Math.min(96, (ratio / 30) * 100)}%` }} /></div>
      <label className="study-range-label"><span><span>compression ratio</span><output>{ratio}:1</output></span><input type="range" min="1" max="30" value={ratio} onChange={(event) => setRatio(Number(event.target.value))} /></label>
      <StudyCaption>Higher ratios save more storage, while the retained quality depends on the content and codec.</StudyCaption>
    </StudyFrame>
  );
}

type Matrix = number[][];
const zigzag = Array.from({ length: 64 }, (_, index) => ({ row: Math.floor(index / 8), col: index % 8 }))
  .sort((a, b) => a.row + a.col - (b.row + b.col) || a.row - b.row);

function dct2d(pixels: number[][]): Matrix {
  return Array.from({ length: 8 }, (_, u) => Array.from({ length: 8 }, (_, v) => {
    let sum = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        sum += pixels[x][y] * Math.cos(((2 * x + 1) * u * Math.PI) / 16) * Math.cos(((2 * y + 1) * v * Math.PI) / 16);
      }
    }
    const cu = u === 0 ? Math.SQRT1_2 : 1;
    const cv = v === 0 ? Math.SQRT1_2 : 1;
    return 0.25 * cu * cv * sum;
  }));
}

function DctStudy() {
  const sourceRef = useRef<HTMLCanvasElement>(null);
  const outputRef = useRef<HTMLCanvasElement>(null);
  const [coefficients, setCoefficients] = useState<Matrix | null>(null);
  const [pixels, setPixels] = useState<Matrix | null>(null);
  const [retained, setRetained] = useState(18);

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const source = sourceRef.current;
      const output = outputRef.current;
      if (!source || !output) return;
      const context = source.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 200, 150, 8, 8, 0, 0, 8, 8);
      const rgba = context.getImageData(0, 0, 8, 8).data;
      const block = Array.from({ length: 8 }, (_, row) => Array.from({ length: 8 }, (_, col) => {
        const index = (row * 8 + col) * 4;
        return 0.299 * rgba[index] + 0.587 * rgba[index + 1] + 0.114 * rgba[index + 2];
      }));
      setPixels(block);
      setCoefficients(dct2d(block));
    };
    image.src = asset("kodim20.png");
  }, []);

  const retainedCells = new Set(zigzag.slice(0, retained).map(({ row, col }) => `${row}-${col}`));
  useEffect(() => {
    if (!coefficients || !outputRef.current) return;
    const canvas = outputRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    const kept = zigzag.slice(0, retained);
    const data = context.createImageData(8, 8);
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        let value = 0;
        for (const { row: u, col: v } of kept) {
          const cu = u === 0 ? Math.SQRT1_2 : 1;
          const cv = v === 0 ? Math.SQRT1_2 : 1;
          value += 0.25 * cu * cv * coefficients[u][v] * Math.cos(((2 * x + 1) * u * Math.PI) / 16) * Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
        const pixel = Math.max(0, Math.min(255, Math.round(value)));
        const offset = (x * 8 + y) * 4;
        data.data[offset] = pixel;
        data.data[offset + 1] = pixel;
        data.data[offset + 2] = pixel;
        data.data[offset + 3] = 255;
      }
    }
    context.putImageData(data, 0, 0);
  }, [coefficients, retained]);

  return (
    <StudyFrame title="An 8×8 DCT block" hint="section 2.2.1 · retain low frequencies">
      <div className="dct-visuals">
        <div className="dct-coefficient-wrap">
          <div className="dct-grid" role="img" aria-label={`${retained} of 64 DCT coefficients retained; the upper-left values are low frequency`}>
            {Array.from({ length: 64 }, (_, index) => {
              const row = Math.floor(index / 8);
              const col = index % 8;
              const kept = retainedCells.has(`${row}-${col}`);
              const value = coefficients ? Math.round(coefficients[row][col]) : 0;
              return <span key={index} className={kept ? "is-retained" : ""} title={`row ${row + 1}, column ${col + 1}${kept ? `, coefficient ${value}` : ", discarded"}`}>{kept ? value : "·"}</span>;
            })}
          </div>
          <div className="dct-grid-ends"><span>low frequency</span><span>high frequency</span></div>
        </div>
        <div className="dct-preview">
          <div className="dct-canvases">
            <div><canvas ref={sourceRef} width="8" height="8" aria-label="Original 8 by 8 grayscale block" /><span>source block</span></div>
            <span className="dct-arrow" aria-hidden="true">→</span>
            <div><canvas ref={outputRef} width="8" height="8" aria-label={`Reconstruction using ${retained} frequency coefficients`} /><span>reconstructed</span></div>
          </div>
        </div>
      </div>
      <label className="study-range-label">
        <span><span>Coefficients kept</span><output>{retained} / 64</output></span>
        <input type="range" min="1" max="64" value={retained} onChange={(event) => setRetained(Number(event.target.value))} />
      </label>
    </StudyFrame>
  );
}

type Bitrate = "wav" | "128" | "64" | "32" | "16";
const bitrateOptions: { value: Bitrate; label: string; cutoff: number; image: string }[] = [
  { value: "wav", label: "WAV", cutoff: 20000, image: "" },
  { value: "128", label: "128 kbps", cutoff: 15000, image: "" },
  { value: "64", label: "64 kbps", cutoff: 9500, image: "" },
  { value: "32", label: "32 kbps", cutoff: 5800, image: "" },
  { value: "16", label: "16 kbps", cutoff: 3600, image: "" },
];
const demoDuration = 6;

type AudioExcerpt = { samples: Float32Array; sampleRate: number };
type Spectrum = { bins: number[][]; sampleRate: number; seconds: number; frameSize: number; hop: number };

function readWavExcerpt(buffer: ArrayBuffer): AudioExcerpt {
  const view = new DataView(buffer);
  let channels = 1;
  let sampleRate = 44100;
  let bitsPerSample = 16;
  let dataStart = 44;
  let dataSize = view.byteLength - dataStart;
  for (let offset = 12; offset + 8 <= view.byteLength;) {
    const name = String.fromCharCode(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    const size = view.getUint32(offset + 4, true);
    if (name === "fmt ") {
      channels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    }
    if (name === "data") { dataStart = offset + 8; dataSize = size; break; }
    offset += 8 + size + (size % 2);
  }
  if (bitsPerSample !== 16) throw new Error("Expected a 16-bit PCM WAV excerpt");
  const channelCount = Math.max(1, channels);
  const sampleCount = Math.floor(dataSize / (2 * channelCount));
  const samples = new Float32Array(sampleCount);
  for (let index = 0; index < sampleCount; index++) {
    let sample = 0;
    for (let channel = 0; channel < channelCount; channel++) sample += view.getInt16(dataStart + (index * channelCount + channel) * 2, true);
    samples[index] = sample / channelCount;
  }
  return { samples, sampleRate };
}

function fft(real: Float64Array, imag: Float64Array) {
  const size = real.length;
  for (let index = 1, reversed = 0; index < size; index++) {
    let bit = size >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (index < reversed) {
      [real[index], real[reversed]] = [real[reversed], real[index]];
      [imag[index], imag[reversed]] = [imag[reversed], imag[index]];
    }
  }
  for (let span = 2; span <= size; span <<= 1) {
    const angle = (-2 * Math.PI) / span;
    const stepReal = Math.cos(angle);
    const stepImag = Math.sin(angle);
    for (let start = 0; start < size; start += span) {
      let phaseReal = 1;
      let phaseImag = 0;
      for (let offset = 0; offset < span / 2; offset++) {
        const even = start + offset;
        const odd = even + span / 2;
        const oddReal = real[odd] * phaseReal - imag[odd] * phaseImag;
        const oddImag = real[odd] * phaseImag + imag[odd] * phaseReal;
        real[odd] = real[even] - oddReal;
        imag[odd] = imag[even] - oddImag;
        real[even] += oddReal;
        imag[even] += oddImag;
        [phaseReal, phaseImag] = [phaseReal * stepReal - phaseImag * stepImag, phaseReal * stepImag + phaseImag * stepReal];
      }
    }
  }
}

function makeSpectrum({ samples, sampleRate }: AudioExcerpt): Spectrum {
  const frameSize = 512;
  const hop = 128;
  const frames = Math.max(1, Math.ceil(samples.length / hop));
  const window = Array.from({ length: frameSize }, (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (frameSize - 1)));
  const windowSum = window.reduce((sum, value) => sum + value, 0);
  const bins = Array.from({ length: frames }, (_, frame) => {
    const real = new Float64Array(frameSize);
    const imag = new Float64Array(frameSize);
    for (let index = 0; index < frameSize; index++) real[index] = (samples[frame * hop + index - frameSize / 2] || 0) * window[index];
    fft(real, imag);
    return Array.from({ length: frameSize / 2 + 1 }, (_, bin) => {
      const scale = bin === 0 || bin === frameSize / 2 ? 1 : 2;
      const amplitude = scale * Math.hypot(real[bin], imag[bin]) / windowSum;
      return 20 * Math.log10(amplitude + 1e-9);
    });
  });
  return { bins, sampleRate, seconds: samples.length / sampleRate, frameSize, hop };
}

const spectrogramStops = ["--spectrum-low", "--spectrum-indigo", "--spectrum-blue", "--spectrum-teal", "--spectrum-gold", "--spectrum-hot", "--spectrum-peak"];

function parseColor(value: string) {
  const hex = value.trim().replace(/^#/, "");
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function spectrogramColor(value: number, colors: number[][]) {
  const position = Math.pow(Math.max(0, Math.min(0.9999, value)), 1.35) * (colors.length - 1);
  const index = Math.floor(position);
  const blend = position - index;
  const color = colors[index].map((start, channel) => Math.round(start + (colors[index + 1][channel] - start) * blend));
  return `rgb(${color[0]} ${color[1]} ${color[2]})`;
}

function Spectrogram({ excerpt, label }: { excerpt: AudioExcerpt | undefined; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrum = useMemo(() => excerpt ? makeSpectrum(excerpt) : null, [excerpt]);
  const [cursor, setCursor] = useState<{ frame: number; bin: number } | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !spectrum) return;
    const draw = () => {
      const width = 880;
      const height = 520;
      const density = Math.max(0.35, canvas.clientWidth / width);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density * pixelRatio);
      canvas.height = Math.round(height * density * pixelRatio);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(density * pixelRatio, 0, 0, density * pixelRatio, 0, 0);
      const font = (size: number, weight = "400") => `${weight} ${size / density}px "Helvetica Neue", Helvetica, sans-serif`;
      const style = getComputedStyle(canvas);
      const muted = style.getPropertyValue("--muted").trim() || "#aaa6a2";
      const line = style.getPropertyValue("--line").trim() || "#383735";
      const colors = spectrogramStops.map((name) => parseColor(style.getPropertyValue(name)));
      const left = 90;
      const top = 42;
      const plotWidth = 620;
      const plotHeight = 340;
      const right = left + plotWidth;
      const bottom = top + plotHeight;
      const minDb = -90;
      const maxDb = 0;
      const nyquist = spectrum.sampleRate / 2;
      context.clearRect(0, 0, width, height);
      context.fillStyle = muted;
      context.textAlign = "center";
      context.font = font(16, "500");
      context.fillText(`${label} · ${Math.round(spectrum.seconds * 1000)} ms excerpt`, left + plotWidth / 2, 20);

      const frameWidth = plotWidth / spectrum.bins.length;
      const binHeight = plotHeight / spectrum.bins[0].length;
      for (let frame = 0; frame < spectrum.bins.length; frame++) {
        for (let bin = 0; bin < spectrum.bins[frame].length; bin++) {
          const level = (spectrum.bins[frame][bin] - minDb) / (maxDb - minDb);
          context.fillStyle = spectrogramColor(level, colors);
          context.fillRect(left + frame * frameWidth, bottom - (bin + 1) * binHeight, frameWidth + 0.5, binHeight + 0.5);
        }
      }

      context.font = font(13);
      context.textAlign = "right";
      for (const frequency of [0, 5000, 10000, 15000, 20000]) {
        const y = bottom - (frequency / nyquist) * plotHeight;
        context.strokeStyle = line;
        context.globalAlpha = 0.72;
        context.beginPath(); context.moveTo(left, y); context.lineTo(right, y); context.stroke();
        context.globalAlpha = 1;
        context.fillStyle = muted;
        context.fillText(frequency.toLocaleString(), left - 10, y + 4);
      }
      context.strokeStyle = muted;
      context.beginPath(); context.moveTo(left, top); context.lineTo(left, bottom); context.lineTo(right, bottom); context.stroke();
      context.textAlign = "center";
      for (let tick = 0; tick <= 5; tick++) {
        const time = (spectrum.seconds * tick) / 5;
        const x = left + (time / spectrum.seconds) * plotWidth;
        context.strokeStyle = line;
        context.beginPath(); context.moveTo(x, bottom); context.lineTo(x, bottom + 4); context.stroke();
        context.fillStyle = muted;
        context.fillText(time.toFixed(2), x, bottom + 18);
      }
      context.fillStyle = muted;
      context.font = font(17);
      context.fillText("Time from excerpt start (s)", left + plotWidth / 2, height - 10);
      context.save(); context.translate(14, top + plotHeight / 2); context.rotate(-Math.PI / 2); context.fillText("Frequency (Hz)", 0, 0); context.restore();

      const barX = right + 26;
      const barWidth = 14;
      for (let pixel = 0; pixel < plotHeight; pixel++) {
        context.fillStyle = spectrogramColor(1 - pixel / (plotHeight - 1), colors);
        context.fillRect(barX, top + pixel, barWidth, 1);
      }
      context.font = font(12);
      context.textAlign = "left";
      context.fillStyle = muted;
      for (const db of [0, -20, -40, -60, -80]) {
        const y = top + ((maxDb - db) / (maxDb - minDb)) * plotHeight;
        context.fillText(String(db), barX + barWidth + 6, y + 3);
      }
      context.save(); context.translate(866, top + plotHeight / 2); context.rotate(-Math.PI / 2); context.font = font(17); context.textAlign = "center"; context.fillText("Level (dBFS)", 0, 0); context.restore();
      if (cursor) {
        const cursorX = left + ((cursor.frame + 0.5) / spectrum.bins.length) * plotWidth;
        const cursorY = bottom - ((cursor.bin + 0.5) / spectrum.bins[0].length) * plotHeight;
        context.strokeStyle = spectrogramColor(1, colors);
        context.lineWidth = 1;
        context.setLineDash([4, 4]);
        context.beginPath();
        context.moveTo(cursorX, top);
        context.lineTo(cursorX, bottom);
        context.moveTo(left, cursorY);
        context.lineTo(right, cursorY);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = spectrogramColor(1, colors);
        context.beginPath();
        context.arc(cursorX, cursorY, 3, 0, Math.PI * 2);
        context.fill();
      }
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [cursor, label, spectrum]);
  if (!spectrum) return <div className="audio-spectrogram-loading" role="status">Loading source spectrogram…</div>;
  const selectAt = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const plotLeft = bounds.width * (90 / 880);
    const plotTop = bounds.height * (42 / 520);
    const plotWidth = bounds.width * (620 / 880);
    const plotHeight = bounds.height * (340 / 520);
    const x = Math.max(plotLeft, Math.min(plotLeft + plotWidth, event.clientX - bounds.left));
    const y = Math.max(plotTop, Math.min(plotTop + plotHeight, event.clientY - bounds.top));
    const frame = Math.max(0, Math.min(spectrum.bins.length - 1, Math.floor(((x - plotLeft) / plotWidth) * spectrum.bins.length)));
    const bin = Math.max(0, Math.min(spectrum.bins[0].length - 1, Math.round((1 - (y - plotTop) / plotHeight) * (spectrum.bins[0].length - 1))));
    setCursor({ frame, bin });
  };
  const activeBin = cursor && spectrum ? spectrum.bins[cursor.frame][cursor.bin] : null;
  const activeTime = cursor && spectrum ? (cursor.frame * spectrum.hop) / spectrum.sampleRate : null;
  const activeFrequency = cursor && spectrum ? cursor.bin * spectrum.sampleRate / spectrum.frameSize : null;
  return (
    <>
      <canvas
        ref={canvasRef}
        className="audio-spectrogram-canvas"
        role="img"
        aria-label={`${label} spectrogram, ${Math.round(spectrum.seconds * 1000)} millisecond excerpt. Use arrow keys or point to inspect frequency, time, and level.`}
        tabIndex={0}
        onPointerDown={selectAt}
        onPointerMove={selectAt}
        onPointerLeave={() => setCursor(null)}
        onKeyDown={(event) => {
          if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          setCursor((current) => {
            const frame = current?.frame ?? Math.floor(spectrum.bins.length / 2);
            const bin = current?.bin ?? Math.floor(spectrum.bins[0].length / 2);
            if (event.key === "Home") return { frame: 0, bin };
            if (event.key === "End") return { frame: spectrum.bins.length - 1, bin };
            return {
              frame: Math.max(0, Math.min(spectrum.bins.length - 1, frame + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0))),
              bin: Math.max(0, Math.min(spectrum.bins[0].length - 1, bin + (event.key === "ArrowUp" ? 1 : event.key === "ArrowDown" ? -1 : 0))),
            };
          });
        }}
      />
      <div className="audio-spectrogram-readout" aria-live="polite">
        {cursor && activeBin !== null && activeTime !== null && activeFrequency !== null
          ? `${activeTime.toFixed(3)} s · ${Math.round(activeFrequency).toLocaleString()} Hz · ${activeBin.toFixed(1)} dBFS`
          : "Move over the plot or use arrow keys to inspect"}
      </div>
    </>
  );
}

function makeHarmonicDemo(context: AudioContext) {
  const rate = context.sampleRate;
  const buffer = context.createBuffer(1, rate * demoDuration, rate);
  const samples = buffer.getChannelData(0);
  const notes = [220, 277.18, 329.63, 392, 329.63, 277.18];
  for (let i = 0; i < samples.length; i++) {
    const time = i / rate;
    const note = notes[Math.floor(time) % notes.length];
    const phase = time % 1;
    const envelope = Math.min(1, phase * 18) * Math.exp(-phase * 0.45);
    const tone = Math.sin(2 * Math.PI * note * time)
      + 0.48 * Math.sin(2 * Math.PI * note * 2 * time)
      + 0.24 * Math.sin(2 * Math.PI * note * 3 * time)
      + 0.12 * Math.sin(2 * Math.PI * note * 5 * time);
    const transient = phase < 0.035 ? (Math.random() * 2 - 1) * (1 - phase / 0.035) * 0.13 : 0;
    samples[i] = (tone * envelope * 0.18) + transient;
  }
  return buffer;
}

function formatTime(value: number) {
  return `0:${Math.floor(value).toString().padStart(2, "0")}`;
}

function AudioStudy() {
  const [bitrate, setBitrate] = useState<Bitrate>("wav");
  const [excerpts, setExcerpts] = useState<Partial<Record<Bitrate, AudioExcerpt>>>({});
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const startAtRef = useRef(0);
  const positionRef = useRef(0);
  const active = bitrateOptions.find((option) => option.value === bitrate)!;

  useEffect(() => {
    let cancelled = false;
    const options = bitrateOptions.map(async (option) => {
      const filename = option.value === "wav" ? "original.wav" : `mp3-${option.value}.wav`;
      const response = await fetch(asset(`audio/${filename}`));
      if (!response.ok) throw new Error(`Could not load ${filename}`);
      return [option.value, readWavExcerpt(await response.arrayBuffer())] as const;
    });
    void Promise.all(options).then((loaded) => {
      if (!cancelled) setExcerpts(Object.fromEntries(loaded));
    }).catch(() => {
      if (!cancelled) setExcerpts({});
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const context = contextRef.current;
      if (!context) return;
      const next = (positionRef.current + context.currentTime - startAtRef.current) % demoDuration;
      setTime(next);
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing]);

  const startAt = async (offset: number) => {
    let context = contextRef.current;
    if (!context) {
      context = new AudioContext();
      contextRef.current = context;
    }
    if (context.state === "suspended") await context.resume();
    if (!bufferRef.current) bufferRef.current = makeHarmonicDemo(context);
    sourceRef.current?.stop();
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = bufferRef.current;
    source.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = active.cutoff;
    filter.Q.value = 0.55;
    gain.gain.value = 0.58;
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(0, offset % demoDuration);
    sourceRef.current = source;
    filterRef.current = filter;
    gainRef.current = gain;
    positionRef.current = offset % demoDuration;
    startAtRef.current = context.currentTime;
    setTime(positionRef.current);
    setPlaying(true);
  };

  const pause = () => {
    const context = contextRef.current;
    if (context) positionRef.current = (positionRef.current + context.currentTime - startAtRef.current) % demoDuration;
    sourceRef.current?.stop();
    sourceRef.current = null;
    setTime(positionRef.current);
    setPlaying(false);
  };

  const chooseRate = (next: Bitrate) => {
    setBitrate(next);
    const nextOption = bitrateOptions.find((option) => option.value === next)!;
    if (filterRef.current && contextRef.current) {
      filterRef.current.frequency.setTargetAtTime(nextOption.cutoff, contextRef.current.currentTime, 0.06);
    }
  };

  const seek = (next: number) => {
    if (playing) void startAt(next);
    else { positionRef.current = next; setTime(next); }
  };

  return (
    <StudyFrame title="Hear the bitrate change" hint="section 3.2 · illustrative audio">
      <div className={`audio-study ${bitrate === "wav" ? "audio-is-wav" : "audio-is-mp3"}`}>
        <div className="audio-rate-tabs" role="group" aria-label="Choose audio bitrate">
          {bitrateOptions.map((option) => (
            <button type="button" key={option.value} aria-pressed={bitrate === option.value} onClick={() => chooseRate(option.value)}>{option.label}</button>
          ))}
        </div>
        <div className="audio-transport">
          <button className="audio-play" type="button" onClick={() => playing ? pause() : void startAt(time)} aria-label={playing ? "Pause sample" : "Play sample"}>
            {playing ? <FiPause aria-hidden="true" /> : <FiPlay aria-hidden="true" />}
          </button>
          <input type="range" min="0" max={demoDuration} step="0.05" value={time} onChange={(event) => seek(Number(event.target.value))} aria-label="Audio position" />
          <span className="audio-time">{formatTime(time)} / 0:06</span>
        </div>
        <div className="audio-spectrogram"><Spectrogram excerpt={excerpts[bitrate]} label={active.label} /></div>
        <p className="audio-description">{bitrate === "wav" ? "Listening demo · synthesized tone sample" : `Listening demo · synthesized tone low-pass filtered at ${active.cutoff.toLocaleString()} Hz`}</p>
        <p className="audio-disclosure">The spectrogram uses the supplied 100 ms PCM excerpts: the original WAV and MP3 encodes decoded back to WAV. The essay identifies this slice as 20.0–20.1 s. The listening player is a separate synthesized sample and is labeled illustrative.</p>
      <StudyCaption>Figures 9–13. Frequency is shown on a linear scale to Nyquist; color and the readout show single-bin level in dBFS. Point to the plot or focus it and use the arrow keys to inspect the measured excerpt.</StudyCaption>
      </div>
    </StudyFrame>
  );
}

type GraphPoint = { label: string; x: number; ratio: string; size: string; quality: string; y: number };
const jpegGraph: GraphPoint[] = jpegResults.map((item, index) => ({ label: `Q${item.quality}`, x: 58 + index * 102.75, ratio: item.ratio, size: item.size, quality: `${item.psnr} dB PSNR · ${item.ssim.toFixed(3)} SSIM`, y: 188 - ((item.psnr - 25) / 18) * 145 }));
const mp3Graph: GraphPoint[] = [
  { label: "16 kbps", x: 58, ratio: "~90:1", size: "~120 KB", quality: "MOS 2.0–2.5", y: 169 },
  { label: "32 kbps", x: 195, ratio: "~47:1", size: "~230 KB", quality: "MOS 2.7", y: 137 },
  { label: "64 kbps", x: 332, ratio: "~24:1", size: "~450 KB", quality: "MOS 3.5", y: 91 },
  { label: "128 kbps", x: 469, ratio: "~12:1", size: "~900 KB", quality: "MOS 4.0", y: 61 },
];

function QualityGraph() {
  const [medium, setMedium] = useState<"jpeg" | "mp3">("jpeg");
  const [metric, setMetric] = useState<"psnr" | "ssim">("psnr");
  const [activePoint, setActivePoint] = useState(2);
  const points = medium === "jpeg" ? jpegGraph.map((point, index) => metric === "ssim" ? { ...point, y: 188 - ((jpegResults[index].ssim - 0.78) / 0.22) * 145, quality: `${jpegResults[index].ssim.toFixed(3)} SSIM · ${jpegResults[index].psnr} dB PSNR` } : point) : mp3Graph;
  const selected = points[Math.min(activePoint, points.length - 1)];
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return (
    <StudyFrame title="Where the quality gains flatten" hint="section 4 · select a point">
      <div className="quality-tabs" role="group" aria-label="Choose compression type">
        <button type="button" aria-pressed={medium === "jpeg"} onClick={() => { setMedium("jpeg"); setActivePoint(2); }}>JPEG</button>
        <button type="button" aria-pressed={medium === "mp3"} onClick={() => { setMedium("mp3"); setActivePoint(2); }}>MP3</button>
        {medium === "jpeg" && (
          <div className="quality-metric" role="group" aria-label="JPEG quality metric">
            <button type="button" aria-pressed={metric === "psnr"} onClick={() => setMetric("psnr")}>PSNR</button>
            <button type="button" aria-pressed={metric === "ssim"} onClick={() => setMetric("ssim")}>SSIM</button>
          </div>
        )}
      </div>
      <div className="quality-chart-wrap">
        <svg className="quality-chart" viewBox="0 0 560 235" role="img" aria-label={`${medium.toUpperCase()} quality measurement versus compression ratio`}>
          {[45, 85, 125, 165, 205].map((y) => <line key={y} x1="48" x2="525" y1={y} y2={y} className="quality-grid-line" />)}
          <line x1="48" x2="525" y1="205" y2="205" className="quality-axis" />
          <line x1="48" x2="48" y1="35" y2="205" className="quality-axis" />
          <text x="15" y="120" textAnchor="middle" transform="rotate(-90 15 120)" className="quality-axis-label">quality</text>
          <text x="48" y="225" className="quality-axis-label">less compression</text>
          <text x="525" y="225" textAnchor="end" className="quality-axis-label">more compression →</text>
          <path d={path} className={`quality-line quality-line-${medium}`} />
          {points.map((point, index) => (
            <g key={point.label} className={`quality-point ${activePoint === index ? "is-active" : ""}`} tabIndex={0} role="button" aria-label={`${point.label}, ${point.quality}, ${point.ratio} compression, ${point.size}`} onClick={() => setActivePoint(index)} onMouseEnter={() => setActivePoint(index)} onFocus={() => setActivePoint(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActivePoint(index); } }}>
              <circle cx={point.x} cy={point.y} r="11" className="quality-hit-area" />
              <circle cx={point.x} cy={point.y} r="4.5" className="quality-dot" />
              <text x={point.x} y={point.y - 14} textAnchor="middle" className="quality-point-label">{point.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="quality-readout" aria-live="polite">
        <span className="quality-readout-label">{selected.label}</span>
        <span>{selected.ratio} compression</span>
        <span>{selected.size}</span>
        <strong>{selected.quality}</strong>
      </div>
      <StudyCaption>Hover or focus a point to inspect the measured size and quality values.</StudyCaption>
    </StudyFrame>
  );
}

function TrendFigure({ medium }: { medium: "jpeg" | "mp3" }) {
  const points = medium === "jpeg" ? jpegGraph : mp3Graph;
  const [active, setActive] = useState(2);
  const selected = points[active];
  return (
    <StudyFrame title={medium === "jpeg" ? "JPEG quality versus PSNR" : "MP3 bitrate versus MOS"} hint="select a point for its values">
      <svg className="trend-chart" viewBox="0 0 560 230" role="img" aria-label={medium === "jpeg" ? "Interactive JPEG quality versus PSNR graph" : "Interactive MP3 bitrate versus MOS graph"}>
        {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="48" x2="525" y1={y} y2={y} className="study-grid-line" />)}
        <line x1="48" x2="525" y1="200" y2="200" className="quality-axis" />
        <line x1="48" x2="48" y1="32" y2="200" className="quality-axis" />
        <text x="15" y="116" textAnchor="middle" transform="rotate(-90 15 116)" className="quality-axis-label">{medium === "jpeg" ? "PSNR · dB" : "expected MOS"}</text>
        <text x="48" y="222" className="quality-axis-label">{medium === "jpeg" ? "Q95 · less compression" : "16 kbps"}</text><text x="525" y="222" textAnchor="end" className="quality-axis-label">{medium === "jpeg" ? "Q10 · more compression" : "128 kbps"}</text>
        <path d={points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ")} className={`quality-line quality-line-${medium}`} />
        {points.map((point, index) => <g key={point.label} tabIndex={0} role="button" aria-label={`${point.label}: ${point.quality}; ${point.ratio} compression; ${point.size}`} onClick={() => setActive(index)} onFocus={() => setActive(index)} onMouseEnter={() => setActive(index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setActive(index); }} className={`quality-point ${active === index ? "is-active" : ""}`}><circle cx={point.x} cy={point.y} r="12" className="quality-hit-area"/><circle cx={point.x} cy={point.y} r="5" className="quality-dot"/><text x={point.x} y={point.y - 14} textAnchor="middle" className="quality-point-label">{point.label}</text></g>)}
      </svg>
      <div className="quality-readout"><span className="quality-readout-label">{selected.label}</span><span>{selected.ratio} compression</span><span>{selected.size}</span><strong>{selected.quality}</strong></div>
      <StudyCaption>{medium === "jpeg" ? "Figure 8." : "Figure 14."} Explore the essay’s result values directly. The middle settings balance file-size savings with retained quality.</StudyCaption>
    </StudyFrame>
  );
}

export default function LossyCompressionStudies({ kind }: StudyProps) {
  if (kind === "jpeg") return <JpegComparison />;
  if (kind === "jpeg-overview") return <JpegComparison overview />;
  if (kind === "artifact-zoom") return <ArtifactZoomStudy />;
  if (kind === "jpeg-fidelity") return <JpegFidelityStudy />;
  if (kind === "dct") return <DctStudy />;
  if (kind === "audio") return <AudioStudy />;
  if (kind === "quality") return <QualityGraph />;
  if (kind === "pipeline") return <CompressionPipeline />;
  if (kind === "quantization") return <QuantizationStudy />;
  if (kind === "perception") return <PerceptionStudy />;
  if (kind === "tradeoff") return <TradeoffStudy />;
  if (kind === "jpeg-graph") return <TrendFigure medium="jpeg" />;
  if (kind === "mp3-graph") return <TrendFigure medium="mp3" />;
  return null;
}
