import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FiX } from "react-icons/fi";

const versions = [
  { label: "2024", date: "2023", href: "/versions/1" },
  { label: "june 2026", date: "2025", href: "/versions/2" },
  { label: "current", date: "2026", href: "/" },
] as const;

function versionFromPath(path: string) {
  if (path === "/archive" || path.startsWith("/versions/1")) return 1;
  if (path.startsWith("/versions/2")) return 2;
  return 3;
}

export default function SiteHistory({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const router = useRouter();
  const currentVersion = versionFromPath(router.asPath.split(/[?#]/)[0]);
  const [selectedVersion, setSelectedVersion] = useState(currentVersion);
  const [transitioning, setTransitioning] = useState(false);
  const transitionInProgress = useRef(false);

  useEffect(() => {
    setSelectedVersion(currentVersion);
  }, [currentVersion]);

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
        } else {
          root.dataset.siteVersionFallback = "exit";
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
          await router.push(destination);
          root.dataset.siteVersionFallback = "enter";
          await new Promise((resolve) => window.setTimeout(resolve, 230));
        }
      } finally {
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
            0{selectedVersion}
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
            aria-label={`${version.label}, ${version.date}`}
            aria-current={currentVersion === index + 1 ? "page" : undefined}
            disabled={transitioning}
            onClick={() => void choose(index + 1)}
            onPointerEnter={() => void router.prefetch(version.href)}
            onFocus={() => void router.prefetch(version.href)}
          >
            <span>0{index + 1}</span>
            <small>{version.date}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
