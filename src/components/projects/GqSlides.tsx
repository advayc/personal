import { useState } from "react";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";

const slides = [
  {
    title: "Start with three NASA missions",
    copy: "Kepler, K2, and TESS surfaced the signals. The challenge was sorting candidate planets without inspecting every record by hand.",
    nodes: ["Kepler", "K2", "TESS", "18,413 records"],
    detail: "One merged dataset",
  },
  {
    title: "Make the inputs comparable",
    copy: "The team prepared ten shared planet and star measurements, then split the records 90/10 for training and testing.",
    nodes: ["10 shared features", "normalize", "90% train", "10% test"],
    detail: "Period · transit · radius · temperature · more",
  },
  {
    title: "Train and choose a checkpoint",
    copy: "A feed-forward binary classifier learned from shuffled examples. The best checkpoint was selected from a run of more than 1,000 epochs.",
    nodes: ["training data", "PyTorch model", "epoch 706", "test set"],
    detail: "One candidate → planet / false positive",
  },
  {
    title: "Try one candidate or a whole file",
    copy: "The web app accepts measurements by hand or a CSV. It returns a confidence score and a downloadable results table.",
    nodes: ["candidate / CSV", "classifier", "confidence", "results"],
    detail: "A single prediction or a batch",
  },
  {
    title: "See what the model got right",
    copy: "Performance charts and feature weights make the results easier to inspect. Transit duration, orbital period, and transit depth mattered most in the team's run.",
    nodes: ["ROC curve", "confusion matrix", "feature weights", "prediction"],
    detail: "83% accuracy · 94% recall · 88% F1",
  },
];

export default function GqSlides() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const move = (delta: number) =>
    setIndex((current) => (current + delta + slides.length) % slides.length);
  return (
    <section className="project-story gq-story" aria-labelledby="gq-story-title">
      <div className="story-heading">
        <h2 id="gq-story-title">how gq planets works</h2>
        <a href="https://docs.google.com/presentation/d/1JiyhU4IuTb1Kje2rLznlAdRhKBlf4Y7GpsanNGN1rQ8/edit?usp=sharing">
          original slides <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div
        className="gq-slide"
        key={index}
        aria-label={"Slide " + (index + 1) + " of " + slides.length + ": " + slide.title}
      >
        <div className="gq-slide-copy">
          <span className="story-index">
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <h3>{slide.title}</h3>
          <p>{slide.copy}</p>
        </div>
        <div className="gq-flow" role="img" aria-label={slide.nodes.join(" then ")}>
          {slide.nodes.map((node, step) => (
            <div className="gq-flow-step" key={node}>
              <span className="gq-node-index">{String(step + 1).padStart(2, "0")}</span>
              <strong>{node}</strong>
              {step < slide.nodes.length - 1 && (
                <FiArrowRight className="gq-flow-arrow" aria-hidden="true" />
              )}
            </div>
          ))}
          <p className="gq-flow-detail">{slide.detail}</p>
        </div>
      </div>
      <nav className="gq-slide-nav" aria-label="GQ Planets slides">
        <button aria-label="Previous slide" onClick={() => move(-1)}>
          <FiArrowLeft aria-hidden="true" /> back
        </button>
        <div className="gq-slide-dots" role="group" aria-label="Choose slide">
          {slides.map((item, i) => (
            <button
              key={item.title}
              aria-label={"Slide " + (i + 1) + ": " + item.title}
              aria-current={i === index ? "step" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button aria-label="Next slide" onClick={() => move(1)}>
          next <FiArrowRight aria-hidden="true" />
        </button>
      </nav>
    </section>
  );
}
