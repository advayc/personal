import { useState } from "react";
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
    copy: "The team trained on shuffled records for more than 1,000 epochs. The selected model reached 83% accuracy; the flowchart, confusion matrix, and feature chart are shown below.",
    alt: "Training pipeline flowchart, confusion matrix, and feature-importance bar chart from the presentation",
    details: [
      { src: "/projects/gq-slides/training-flow.webp", alt: "Flowchart from Kepler, K2, and TESS data through cleanup, model training, testing, and outputs", caption: "training flow", width: 558, height: 760 },
      { src: "/projects/gq-slides/confusion-matrix.webp", alt: "Confusion matrix showing 360 and 1,174 correct classifications, and 245 and 63 errors", caption: "confusion matrix", width: 594, height: 395 },
      { src: "/projects/gq-slides/feature-importance.webp", alt: "Bar chart of model feature weights, including transit duration, orbital period, and transit depth", caption: "feature weights", width: 558, height: 395 },
    ],
  },
  {
    title: "The web interface",
    copy: "Visitors can enter one candidate or upload a CSV, get confidence scores, download batch results, and inspect the model charts.",
    alt: "Interface slide with a request-flow diagram and screenshots of GQ Planets",
    details: [
      { src: "/projects/gq-slides/interface-flow.webp", alt: "Flowchart of the single-prediction, CSV batch, and visualization endpoints", caption: "request flow", width: 504, height: 608 },
    ],
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

export default function GqSlides() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <section className="project-story gq-story" aria-labelledby="gq-story-title">
      <div className="story-heading">
        <h2 id="gq-story-title">from the presentation</h2>
        <a href="https://docs.google.com/presentation/d/1JiyhU4IuTb1Kje2rLznlAdRhKBlf4Y7GpsanNGN1rQ8/edit?usp=sharing">
          original slides <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>
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
        {"details" in slide && slide.details && (
          <div className={`gq-slide-details gq-slide-details-${slide.details.length}`} aria-label="Diagrams and charts from this slide">
            {slide.details.map((detail) => (
              <figure key={detail.src}>
                <ProjectImage
                  src={detail.src}
                  alt={detail.alt}
                  width={detail.width}
                  height={detail.height}
                  sizes="(max-width: 740px) 90vw, 300px"
                />
                <figcaption>{detail.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
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
  );
}
