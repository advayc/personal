import { useState, type KeyboardEvent } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import ProjectImage from "@/components/ProjectImage";

const slides = [
  {
    title: "GQ Planets",
    copy: "Our NASA Space Apps project used Kepler, K2, and TESS data to identify exoplanet candidates.",
    alt: "GQ Planets title slide introducing The Sonic Waves and the three NASA missions",
  },
  {
    title: "The problem",
    copy: "Checking candidate signals by hand takes time. We wanted a way to sort the NASA data and let people try their own measurements.",
    alt: "Presentation slide explaining the problem of manually classifying exoplanets",
  },
  {
    title: "Three missions, one dataset",
    copy: "We merged 18,413 records, split them 90/10 for training and testing, trained a classifier, and put predictions in a web app.",
    alt: "Slide showing the combined NASA dataset and two example prediction results",
  },
  {
    title: "Training and results",
    copy: "The team trained on shuffled records for more than 1,000 epochs. The selected model reached 83% accuracy; the original charts are in the slide deck.",
    alt: "Original slide with the training flowchart, confusion matrix, and feature chart",
  },
  {
    title: "The web interface",
    copy: "Visitors can enter one candidate or upload a CSV, get confidence scores, download batch results, and inspect the model charts.",
    alt: "Original slide with the request-flow diagram and screenshots of GQ Planets",
  },
  {
    title: "Where it could help",
    copy: "The idea is to put promising candidates in front of researchers sooner and give students a way to work with real NASA data.",
    alt: "Presentation slide about research and education uses for the classifier",
  },
  {
    title: "What we wanted to add",
    copy: "Our next steps were prediction feedback, searching by planet name, visualizing hypothetical planets, and testing more model architectures.",
    alt: "Presentation slide listing possible next steps for GQ Planets",
  },
] as const;

const stages = [
  {
    title: "NASA observations",
    detail: "Kepler, K2, and TESS supply the transit measurements used by the project.",
  },
  {
    title: "Prepare the data",
    detail: "The records are combined, cleaned, standardized, and divided into training and test sets.",
  },
  {
    title: "Train a classifier",
    detail: "The model learns patterns that separate likely exoplanets from false positives.",
  },
  {
    title: "Check its predictions",
    detail: "A held-out portion of the data is used to measure performance before serving predictions.",
  },
  {
    title: "Explore in the app",
    detail: "A visitor can submit one candidate or a CSV and review prediction confidence and charts.",
  },
] as const;

function GqModelFlow() {
  const [activeStage, setActiveStage] = useState(0);
  const activateOnKey = (event: KeyboardEvent<SVGGElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveStage(index);
    }
  };

  return (
    <section className="gq-model" aria-labelledby="gq-model-title">
      <div className="gq-model-heading">
        <h3 id="gq-model-title">from telescope data to a prediction</h3>
        <p>select a stage to see what happens</p>
      </div>
      <div className="gq-model-scroller" role="region" aria-label="GQ Planets model flow; scroll horizontally on small screens" tabIndex={0}>
        <svg className="gq-model-svg" viewBox="0 0 1000 250" role="group" aria-labelledby="gq-flow-label gq-flow-desc">
          <title id="gq-flow-label">GQ Planets data and prediction flow</title>
          <desc id="gq-flow-desc">NASA telescope measurements pass through data preparation and a trained classifier, are checked against held-out data, then appear in a web application.</desc>
          <defs>
            <linearGradient id="gq-flow-belt" x1="0" x2="1">
              <stop offset="0" stopColor="var(--line)" />
              <stop offset=".52" stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--line)" />
            </linearGradient>
            <pattern id="gq-flow-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <path d="M0 0v9" stroke="var(--line)" strokeWidth="2" />
            </pattern>
          </defs>
          <path className="gq-flow-shadow" d="M48 211H952" />
          <path className="gq-flow-belt" d="M76 190H924" />
          {[94, 300, 500, 700, 902].map((x) => <circle key={x} className="gq-flow-roller" cx={x} cy="190" r="8" />)}
          <path className="gq-flow-current" d="M92 190H923" />
          <path className="gq-flow-arrowhead" d="m930 190-10-6v12z" />

          <g className={`gq-flow-stage${activeStage === 0 ? " is-active" : ""}`} role="button" tabIndex={0} aria-pressed={activeStage === 0} aria-label="Stage one: NASA observations" onClick={() => setActiveStage(0)} onKeyDown={(event) => activateOnKey(event, 0)}>
            <path className="gq-flow-station" d="M38 145V94l13-16h102l13 16v51l-13 13H51z" />
            <path className="gq-flow-machine-top" d="M51 78h102l13 16H38z" />
            <path className="gq-flow-screen" d="M61 98h79v36H61z" />
            <path className="gq-flow-signal" d="M69 119c8-19 13 18 21-1s13-14 20 0 11 9 20-8" />
            <path className="gq-flow-leg" d="M52 158v17m100-17v17" />
            <circle className="gq-flow-port" cx="46" cy="94" r="4" />
            <text className="gq-flow-step" x="48" y="47">01</text>
            <text className="gq-flow-label" x="48" y="67">missions</text>
          </g>

          <g className={`gq-flow-stage${activeStage === 1 ? " is-active" : ""}`} role="button" tabIndex={0} aria-pressed={activeStage === 1} aria-label="Stage two: prepare the data" onClick={() => setActiveStage(1)} onKeyDown={(event) => activateOnKey(event, 1)}>
            <path className="gq-flow-station" d="M230 128h141v29H230z" />
            <path className="gq-flow-machine-top" d="M239 119h122l10 9H230z" />
            <path className="gq-flow-panel" d="M247 83h112v36H247z" />
            <path className="gq-flow-gear" d="M264 101h14m-7-7v14m5-12-10 10m0-10 10 10M306 101h39" />
            <path className="gq-flow-grate" d="M244 138h112m0 12-12-12m-13 12-12-12m-13 12-12-12m-13 12-12-12" />
            <path className="gq-flow-leg" d="M246 157v17m110-17v17" />
            <text className="gq-flow-step" x="230" y="47">02</text>
            <text className="gq-flow-label" x="230" y="67">prepare</text>
          </g>

          <g className={`gq-flow-stage${activeStage === 2 ? " is-active" : ""}`} role="button" tabIndex={0} aria-pressed={activeStage === 2} aria-label="Stage three: train a classifier" onClick={() => setActiveStage(2)} onKeyDown={(event) => activateOnKey(event, 2)}>
            <path className="gq-flow-station" d="M421 139V86l13-13h132l13 13v53l-13 13H434z" />
            <path className="gq-flow-machine-top" d="M434 73h132l13 13H421z" />
            <path className="gq-flow-screen" d="M445 93h110v39H445z" />
            <path className="gq-flow-model-lines" d="M455 123c12-24 20-1 31-13s18-15 27-1 19 1 34-11" />
            <circle className="gq-flow-model-node" cx="466" cy="105" r="3" /><circle className="gq-flow-model-node" cx="487" cy="110" r="3" /><circle className="gq-flow-model-node" cx="510" cy="96" r="3" /><circle className="gq-flow-model-node" cx="532" cy="110" r="3" />
            <path className="gq-flow-leg" d="M437 153v21m113-21v21" />
            <text className="gq-flow-step" x="421" y="47">03</text>
            <text className="gq-flow-label" x="421" y="67">classifier</text>
          </g>

          <g className={`gq-flow-stage${activeStage === 3 ? " is-active" : ""}`} role="button" tabIndex={0} aria-pressed={activeStage === 3} aria-label="Stage four: check its predictions" onClick={() => setActiveStage(3)} onKeyDown={(event) => activateOnKey(event, 3)}>
            <path className="gq-flow-station" d="M635 158V111a55 55 0 0 1 110 0v47z" />
            <path className="gq-flow-machine-top" d="M635 111a55 55 0 0 1 110 0h-14a41 41 0 0 0-82 0z" />
            <path className="gq-flow-dial-face" d="M650 112a40 40 0 0 1 80 0" />
            <path className="gq-flow-dial-ticks" d="m657 95 5 4m6-14 3 6m15-11v7m15-4-2 7m17 3-4 4" />
            <path className="gq-flow-needle" d="m690 112 17-18" />
            <circle className="gq-flow-hub" cx="690" cy="112" r="4" />
            <path className="gq-flow-leg" d="M647 158v16m87-16v16" />
            <text className="gq-flow-step" x="635" y="47">04</text>
            <text className="gq-flow-label" x="635" y="67">evaluate</text>
          </g>

          <g className={`gq-flow-stage${activeStage === 4 ? " is-active" : ""}`} role="button" tabIndex={0} aria-pressed={activeStage === 4} aria-label="Stage five: explore in the app" onClick={() => setActiveStage(4)} onKeyDown={(event) => activateOnKey(event, 4)}>
            <path className="gq-flow-station" d="M830 157V88q0-9 9-9h111q9 0 9 9v69z" />
            <path className="gq-flow-screen" d="M842 91h105v54H842z" />
            <path className="gq-flow-screen-header" d="M842 91h105v10H842z" />
            <circle className="gq-flow-led" cx="849" cy="96" r="1.5" /><circle className="gq-flow-led" cx="855" cy="96" r="1.5" />
            <path className="gq-flow-app-line" d="M852 113h32m-32 8h50m-50 8h24" />
            <path className="gq-flow-app-chart" d="m903 134 8-9 8 4 12-15" />
            <path className="gq-flow-leg" d="M854 157v17m82-17v17" />
            <text className="gq-flow-step" x="830" y="47">05</text>
            <text className="gq-flow-label" x="830" y="67">web app</text>
          </g>

          <text className="gq-flow-base-label" x="500" y="231" textAnchor="middle">one path from archived observations to candidate review</text>
        </svg>
      </div>
      <p className="gq-model-detail" aria-live="polite"><span>0{activeStage + 1}</span>{stages[activeStage].detail}</p>
    </section>
  );
}

export default function GqSlides() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <>
      <GqModelFlow />
      <section className="project-story gq-story" aria-labelledby="gq-story-title">
        <div className="story-heading">
          <h2 id="gq-story-title">from the presentation</h2>
          <a href="https://docs.google.com/presentation/d/1JiyhU4IuTb1Kje2rLznlAdRhKBlf4Y7GpsanNGN1rQ8/edit?usp=sharing">
            original slides <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <p className="gq-presentation-intro">The seven slides show the project from its original problem through the model, results, and web app.</p>
        <div className="gq-slide" key={index} aria-live="polite">
          <div className="gq-slide-copy">
            <span className="story-index">{String(index + 1).padStart(2, "0")} / 07</span>
            <h3>{slide.title}</h3>
            <p>{slide.copy}</p>
          </div>
          <figure className="gq-slide-figure">
            <ProjectImage
              src={`/projects/gq-slides/${index + 1}.webp`}
              alt={slide.alt}
              width={1800}
              height={1013}
              sizes="(max-width: 740px) 90vw, 980px"
            />
            <figcaption>slide {index + 1} of {slides.length} · click to enlarge</figcaption>
          </figure>
        </div>
        <nav className="gq-slide-nav" aria-label="GQ Planets presentation">
          <button type="button" aria-label="Previous slide" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            <FiArrowLeft aria-hidden="true" /> back
          </button>
          <div className="gq-slide-dots" role="group" aria-label="Choose slide">
            {slides.map((item, i) => (
              <button key={item.title} type="button" aria-label={`Slide ${i + 1}: ${item.title}`} aria-current={i === index ? "step" : undefined} onClick={() => setIndex(i)} />
            ))}
          </div>
          <button type="button" aria-label="Next slide" disabled={index === slides.length - 1} onClick={() => setIndex(index + 1)}>
            next <FiArrowRight aria-hidden="true" />
          </button>
        </nav>
      </section>
    </>
  );
}
