import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState, type ReactNode } from "react";
import { FiCommand, FiArrowUpRight } from "react-icons/fi";
import HitCounter from "./HitCounter";
import ThemeSlider from "./ThemeSlider";
import { SiteHistoryTrigger } from "./SiteHistory";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export const backgrounds = [
  { name: "gray", color: "#171717" },
  { name: "black", color: "#000000" },
  { name: "white", color: "#ffffff" },
  { name: "cream", color: "#f4f1ea" },
] as const;
export type Background = (typeof backgrounds)[number]["name"];

export default function SiteLayout({
  children,
  title = "advay chandorkar",
  description = "i like building things and solving problems.",
  wide = false,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  wide?: boolean;
}) {
  const router = useRouter();
  const [background, setBackground] = useState<Background>("gray");
  const [ready, setReady] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolioBackground");
      if (backgrounds.some((b) => b.name === saved))
        setBackground(saved as Background);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.background = background;
    document.documentElement.style.setProperty("--accent-color", "#ff3908");
    document.documentElement.style.setProperty(
      "--accent-color-rgb",
      "255, 57, 8",
    );
    document.documentElement.classList.toggle(
      "light",
      background === "white" || background === "cream",
    );
    try {
      localStorage.setItem("portfolioBackground", background);
    } catch {}
  }, [background, ready]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    const openCommandCenter = () => setCommandOpen(true);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("open-site-command-center", openCommandCenter);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener(
        "open-site-command-center",
        openCommandCenter,
      );
    };
  }, []);
  const color = backgrounds.find((b) => b.name === background)!.color;
  return (
    <div className={`portfolio${wide ? " portfolio-wide" : ""}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={`https://advayc.ca${router.asPath.split("#")[0]}`}
        />
        <meta
          property="og:url"
          content={`https://advayc.ca${router.asPath.split("#")[0]}`}
        />
        <meta name="theme-color" content={color} />
        <link
          key="canonical"
          rel="canonical"
          href={`https://advayc.ca${router.asPath.split("#")[0]}`}
        />
      </Head>
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <div className="site-column">
        <header className="site-header">
          <Link href="/" className="site-name">
            advay chandorkar<span className="accent-dot">.</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/#experience">experience</Link>
            <Link
              href="/projects"
              aria-current={
                router.pathname.startsWith("/projects") ? "page" : undefined
              }
            >
              projects
            </Link>
            <Link
              href="/writing"
              aria-current={router.pathname.startsWith("/writing") ? "page" : undefined}
            >
              writing
            </Link>
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="footer-top">
            <Link href="/systems">systems i find interesting</Link>
            <a href="mailto:advay.chandorkar@gmail.com">
              say hello <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="footer-bottom">
            <div className="footer-meta">
              <SiteHistoryTrigger className="archive-link">
                site versions
              </SiteHistoryTrigger>
              <HitCounter
                id="home"
                showLabel={false}
                className="portfolio-hits"
              />
            </div>
            <div className="site-controls">
              <ThemeSlider value={background} onChange={setBackground} />
              <button
                className="command-trigger"
                aria-label="Open command center"
                aria-haspopup="dialog"
                onClick={() => setCommandOpen(true)}
              >
                <FiCommand aria-hidden="true" />
                <span>command center</span>
                <kbd>K</kbd>
              </button>
            </div>
          </div>
        </footer>
      </div>
      {commandOpen && (
        <CommandPalette
          isOpen={commandOpen}
          onClose={() => setCommandOpen(false)}
          background={background}
          onBackgroundChange={setBackground}
        />
      )}
    </div>
  );
}
