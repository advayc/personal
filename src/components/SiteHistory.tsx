import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";

const OPEN_HISTORY_EVENT = "portfolio:open-site-history";
const versions = [
  { label: "original site", href: "/versions/1" },
  { label: "advay.ca", href: "/versions/2" },
  { label: "current site", href: "/" },
] as const;

export function openSiteHistory() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_HISTORY_EVENT));
}

export function SiteHistoryTrigger({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openSiteHistory();
      }}
    >
      {children}
    </button>
  );
}

function versionFromPath(path: string) {
  if (path === "/archive" || path.startsWith("/versions/1")) return 1;
  if (path.startsWith("/versions/2")) return 2;
  return 3;
}

export default function SiteHistory() {
  const router = useRouter();
  const currentVersion = versionFromPath(router.asPath.split(/[?#]/)[0]);
  const [selectedVersion, setSelectedVersion] = useState(currentVersion);
  const [open, setOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const transitionInProgress = useRef(false);

  useEffect(() => {
    setSelectedVersion(currentVersion);
    if (currentVersion !== 3) setOpen(true);
  }, [currentVersion]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_HISTORY_EVENT, show);
    return () => window.removeEventListener(OPEN_HISTORY_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    versions.forEach(({ href }) => {
      if (href !== router.asPath.split(/[?#]/)[0]) void router.prefetch(href);
    });
  }, [open, router]);

  const choose = async (next: number) => {
    if (transitionInProgress.current) return;
    setSelectedVersion(next);
    setOpen(true);
    const destination = versions[next - 1]?.href;
    if (destination && destination !== router.asPath.split(/[?#]/)[0]) {
      transitionInProgress.current = true;
      setTransitioning(true);
      const root = document.documentElement;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      try {
        if (reducedMotion) {
          await router.push(destination);
        } else if (document.startViewTransition) {
          root.dataset.siteVersionMotion = "active";
          const transition = document.startViewTransition(async () => {
            await router.push(destination);
          });
          await transition.finished;
        } else {
          root.dataset.siteVersionFallback = "exit";
          await new Promise((resolve) => window.setTimeout(resolve, 130));
          await router.push(destination);
          root.dataset.siteVersionFallback = "enter";
          await new Promise((resolve) => window.setTimeout(resolve, 380));
        }
      } finally {
        delete root.dataset.siteVersionMotion;
        delete root.dataset.siteVersionFallback;
        transitionInProgress.current = false;
        setTransitioning(false);
      }
    }
  };

  if (!open) {
    if (currentVersion === 3) return null;
    return (
      <button
        className="site-version-launcher"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open site versions"
      >
        site versions <span aria-hidden="true">↗</span>
      </button>
    );
  }

  return (
    <aside className="site-version-overlay" aria-label="Site versions" aria-busy={transitioning}>
      <div className="site-version-topline">
        <span>site versions</span>
        <div>
          <output htmlFor="site-version-range">
            0{selectedVersion} <i aria-hidden="true">·</i> {versions[selectedVersion - 1].label}
          </output>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close site versions">
            <FiX aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="site-version-track">
        <div className="site-version-rail" aria-hidden="true">
          {versions.map((version, index) => (
            <i key={version.href} className={selectedVersion === index + 1 ? "active" : ""} />
          ))}
        </div>
        <input
          id="site-version-range"
          type="range"
          min="1"
          max="3"
          step="1"
          value={selectedVersion}
          disabled={transitioning}
          aria-label="Website version"
          aria-valuetext={`Version ${selectedVersion}: ${versions[selectedVersion - 1].label}`}
          onChange={(event) => void choose(Number(event.target.value))}
        />
      </div>
      <div className="site-version-labels">
        {versions.map((version, index) => (
          <button
            key={version.href}
            type="button"
            aria-current={currentVersion === index + 1 ? "page" : undefined}
            disabled={transitioning}
            onClick={() => void choose(index + 1)}
          >
            <span>0{index + 1}</span>
            {version.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
