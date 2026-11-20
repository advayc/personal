import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Components } from "hast-util-to-jsx-runtime";
import dynamic from "next/dynamic";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";
import LossyCompressionStudies from "./LossyCompressionStudies";
import ProjectImage from "@/components/ProjectImage";
import type { Heading, WritingDocument } from "@/lib/compileWriting";

const CardMathStudy = dynamic(() => import("./CardMathStudy"));
type Typeface = "serif" | "sans" | "mono";

type MarkdownDivProps = ComponentProps<"div"> & {
  "data-writing-directive"?: string;
  "data-type"?: string;
};

function MarkdownDirective({ children, ...props }: MarkdownDivProps) {
  const directive = props["data-writing-directive"];
  const type = props["data-type"] || "";
  if (directive === "interactive") {
    if (type === "card-math") return <CardMathStudy />;
    return <LossyCompressionStudies kind={type} />;
  }
  if (directive === "sources") {
    return (
      <details className="writing-sources">
        <summary>Sources <FiChevronDown aria-hidden="true" /></summary>
        <div className="writing-source-list">{children}</div>
      </details>
    );
  }
  return <div {...props}>{children}</div>;
}

const markdownComponents: Partial<Components> = {
  div: MarkdownDirective,
  img: ({ alt, src }) => src ? (
    <ProjectImage
      src={src}
      alt={alt || "Essay figure"}
      width={768}
      height={512}
      sizes="(max-width: 900px) 100vw, 70ch"
      className="writing-image-zoom"
    />
  ) : null,
};

const typefaceLabels: Record<Typeface, string> = {
  serif: "Serif",
  sans: "Sans",
  mono: "Mono",
};

function FontPicker({ value, onChange }: { value: Typeface; onChange: (font: Typeface) => void }) {
  const pickerRef = useRef<HTMLDetailsElement>(null);
  return (
    <details className="writing-font-picker" ref={pickerRef}>
      <summary aria-label={`Change article font. Current font: ${typefaceLabels[value]}`}>
        <span className="writing-font-mark" aria-hidden="true">Aa</span>
        <span>{typefaceLabels[value]}</span>
        <FiChevronDown aria-hidden="true" />
      </summary>
      <div className="writing-font-menu" role="group" aria-label="Article font">
        {(Object.keys(typefaceLabels) as Typeface[]).map((font) => (
          <button
            key={font}
            type="button"
            className={`writing-font-option writing-font-option-${font}`}
            aria-pressed={value === font}
            onClick={() => {
              onChange(font);
              if (pickerRef.current) pickerRef.current.open = false;
            }}
          >
            <span>Aa</span>
            <span>{typefaceLabels[font]}</span>
            {value === font && <span className="writing-font-check" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </details>
  );
}

function Contents({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState(headings[0]?.id || "");
  const desktopNavRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const headingElements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (headingElements.length === 0) return;
    let timer: number | undefined;
    const updateActiveHeading = () => {
      if (timer !== undefined) return;
      timer = window.setTimeout(() => {
        timer = undefined;
        let current = headingElements[0];
        const readingLine = window.innerHeight * 0.25;
        for (const heading of headingElements) {
          if (heading.getBoundingClientRect().top <= readingLine) current = heading;
          else break;
        }
        const atDocumentEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        if (atDocumentEnd) current = headingElements[headingElements.length - 1];
        setActiveHeading(current.id);
      }, 50);
    };
    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [headings]);
  useEffect(() => {
    const nav = desktopNavRef.current;
    if (!nav || !activeHeading) return;
    const activeLink = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[href]")).find(
      (link) => link.getAttribute("href") === `#${activeHeading}`,
    );
    if (!activeLink) return;
    const navBounds = nav.getBoundingClientRect();
    const linkBounds = activeLink.getBoundingClientRect();
    const inset = 12;
    if (linkBounds.top < navBounds.top + inset) {
      nav.scrollTo({ top: nav.scrollTop - (navBounds.top + inset - linkBounds.top), behavior: "smooth" });
    } else if (linkBounds.bottom > navBounds.bottom - inset) {
      nav.scrollTo({ top: nav.scrollTop + (linkBounds.bottom - navBounds.bottom + inset), behavior: "smooth" });
    }
  }, [activeHeading]);
  const links = (
    <ol>
      {headings.map((heading) => (
        <li key={heading.id} className={`writing-toc-level-${heading.level}`}>
          <a
            className={activeHeading === heading.id ? "is-active" : undefined}
            href={`#${heading.id}`}
            onClick={() => setOpen(false)}
          >
            {heading.label}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <details className="writing-toc-mobile" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
        <summary>On this page <FiChevronDown aria-hidden="true" /></summary>
        {links}
      </details>
      <nav className="writing-toc" aria-label="On this page" ref={desktopNavRef}>
        <span className="writing-toc-title">On this page</span>
        {links}
      </nav>
    </>
  );
}

export default function WritingReader({ article, pdfHref }: { article: WritingDocument; pdfHref?: string }) {
  const content = useMemo(() => toJsxRuntime(article.tree, {
    Fragment, jsx, jsxs, components: markdownComponents, ignoreInvalidStyle: true,
  }), [article.tree]);
  const [typeface, setTypeface] = useState<Typeface>("sans");

  const changeTypeface = (font: Typeface) => {
    setTypeface(font);
  };

  return (
    <div className={`writing-reader typeface-${typeface}`}>
      <div className="writing-reader-tools">
        {pdfHref && (
          <a
            className="writing-pdf-link"
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>view PDF</span>
            <FiExternalLink aria-hidden="true" />
          </a>
        )}
        <FontPicker value={typeface} onChange={changeTypeface} />
      </div>
      <div className="writing-reader-grid">
        <Contents headings={article.headings} />
        <article className={`writing-body typeface-${typeface}`}>
          {content}
          <div className="writing-word-count">{article.words.toLocaleString()} words</div>
        </article>
      </div>
    </div>
  );
}
