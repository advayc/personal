import { useRef } from "react";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { timeline } from "@/lib/timeline";
export default function Timeline() {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) =>
    track.current?.scrollBy({
      left: direction * 560,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <SiteLayout title="how i got here" wide>
      <header className="page-intro timeline-heading">
        <div>
          <h1>how i got here.</h1>
          <p>circuits, code, and a lot of figuring it out.</p>
        </div>
        <div className="timeline-buttons">
          <button onClick={() => move(-1)} aria-label="Earlier in timeline">
            <FiArrowLeft />
          </button>
          <button onClick={() => move(1)} aria-label="Later in timeline">
            <FiArrowRight />
          </button>
        </div>
      </header>
      <div
        className="timeline-scroll"
        ref={track}
        role="region"
        aria-label="My journey, scroll horizontally for later years"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        <div
          className="timeline-track"
          style={{ "--events": timeline.length } as React.CSSProperties}
        >
          <svg
            className="timeline-spine"
            width={timeline.length * 280}
            height={420}
            aria-hidden="true"
          >
            <path d={`M 24 210 H ${timeline.length * 280 - 100}`} />
            {timeline.map((_, i) => (
              <g key={i}>
                <path
                  className="timeline-branch"
                  d={
                    i % 2 === 0
                      ? `M ${i * 280 + 24} 210 C ${i * 280 + 55} 210 ${i * 280 + 45} 184 ${i * 280 + 80} 184`
                      : `M ${i * 280 + 24} 210 C ${i * 280 + 55} 210 ${i * 280 + 45} 240 ${i * 280 + 80} 240`
                  }
                />
                <circle cx={i * 280 + 24} cy={210} r={4} />
              </g>
            ))}
          </svg>
          <ol>
            {timeline.map((item, i) => (
              <li
                key={item.date}
                className={i % 2 ? "timeline-below" : "timeline-above"}
              >
                <time>{item.date}</time>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                {item.links && (
                  <div className="timeline-links">
                    {item.links.map((link) => link.href.startsWith('http') ? <a key={link.href} href={link.href}>{link.label}</a> : <Link key={link.href} href={link.href}>{link.label}</Link>)}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <Link href="/" className="back-link timeline-back">
        <FiArrowLeft /> back home
      </Link>
    </SiteLayout>
  );
}
