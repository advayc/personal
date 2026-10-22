import { useEffect, useMemo, useRef, useState, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import { FiChevronDown } from "react-icons/fi";
import LossyCompressionStudies from "./LossyCompressionStudies";
import ProjectImage from "@/components/ProjectImage";

type Heading = { id: string; label: string; level: number };
type Typeface = "serif" | "sans" | "mono";

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textFromNode((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function readHeadings(markdown: string): Heading[] {
  return Array.from(markdown.matchAll(/^(#{2,4})\s+(.+)$/gm), ([, marks, label]) => ({
    id: slugifyHeading(label),
    label,
    level: marks.length,
  }));
}

type DirectiveNode = {
  type?: string;
  name?: string;
  value?: string;
  attributes?: Record<string, string | null | undefined>;
  data?: Record<string, unknown>;
  children?: DirectiveNode[];
};

const writingDirectives: Plugin<[], Root> = () => (tree) => {
  const visit = (node: DirectiveNode) => {
    // Keep ordinary prose such as ratios (5:1) and DOIs (doi:10...) literal.
    if (node.type === "textDirective" && node.name) {
      node.type = "text";
      node.value = `:${node.name}`;
      delete node.name;
      delete node.attributes;
      delete node.children;
      return;
    }
    if (node.type === "containerDirective" && node.name) {
      const kind = node.name === "interactive" ? "interactive" : node.name;
      node.data = {
        ...node.data,
        hName: "div",
        hProperties: {
          "data-writing-directive": kind,
          "data-type": node.attributes?.type || "",
        },
      };
    }
    node.children?.forEach(visit);
  };
  visit(tree as unknown as DirectiveNode);
};

function makeHeading(level: 1 | 2 | 3 | 4) {
  const Tag = `h${level}` as const;
  return function MarkdownHeading({ children, ...props }: ComponentProps<typeof Tag>) {
    return <Tag id={slugifyHeading(textFromNode(children))} {...props}>{children}</Tag>;
  };
}

type MarkdownDivProps = ComponentProps<"div"> & {
  "data-writing-directive"?: string;
  "data-type"?: string;
};

function MarkdownDirective({ children, ...props }: MarkdownDivProps) {
  const directive = props["data-writing-directive"];
  const type = props["data-type"] || "";
  if (directive === "interactive") {
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

const markdownComponents: Components = {
  h1: makeHeading(1),
  h2: makeHeading(2),
  h3: makeHeading(3),
  h4: makeHeading(4),
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

export default function WritingReader({ markdown }: { markdown: string }) {
  const headings = useMemo(() => readHeadings(markdown), [markdown]);
  const [typeface, setTypeface] = useState<Typeface>("sans");

  const changeTypeface = (font: Typeface) => {
    setTypeface(font);
  };

  return (
    <div className={`writing-reader typeface-${typeface}`}>
      <div className="writing-reader-tools">
        <FontPicker value={typeface} onChange={changeTypeface} />
      </div>
      <div className="writing-reader-grid">
        <Contents headings={headings} />
        <article className={`writing-body typeface-${typeface}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkDirective, writingDirectives]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {markdown}
          </ReactMarkdown>
          <div className="writing-word-count">3,623 words</div>
        </article>
      </div>
    </div>
  );
}
