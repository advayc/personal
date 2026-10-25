import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/router";
import ThemeSlider from "./ThemeSlider";
import { FiArrowUpRight, FiArrowRight, FiSearch, FiX } from "react-icons/fi";
import { openSiteHistory } from "./SiteHistoryTrigger";
import { accentColors, type AccentColor } from "@/lib/theme";
import { FaGithub, FaLinkedin, FaXTwitter, FaEnvelope } from "react-icons/fa6";

type Background = "gray" | "black" | "white" | "cream";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  background?: Background;
  onBackgroundChange?: (background: Background) => void;
  accentColor?: AccentColor;
  onAccentColorChange?: (accentColor: AccentColor) => void;
}
const destinations = [
  { label: "home", detail: "a little about me", href: "/" },
  { label: "projects", detail: "things i’ve built", href: "/projects" },
  {
    label: "systems",
    detail: "interactive things i find interesting",
    href: "/systems",
  },
  {
    label: "experience",
    detail: "what i’m doing now and before",
    href: "/#experience",
  },
  { label: "résumé", detail: "open PDF", href: "/advay_resume.pdf", external: true },
  {
    label: "email",
    detail: "get in touch",
    href: "mailto:me@advay.ca",
    external: true,
  },
  {
    label: "github",
    detail: "code and experiments",
    href: "https://github.com/advayc",
    external: true,
  },
  {
    label: "linkedin",
    detail: "connect with me",
    href: "https://www.linkedin.com/in/advay/",
    external: true,
  },
  {
    label: "x",
    detail: "follow along",
    href: "https://x.com/advay_c",
    external: true,
  },
  { label: "site versions", detail: "browse earlier designs", href: "#site-versions" },
  {
    label: "website source",
    detail: "this site on github",
    href: "https://github.com/advayc/personal",
    external: true,
  },
];

export default function CommandPalette({
  isOpen,
  onClose,
  background = "gray",
  onBackgroundChange,
  accentColor = "orange",
  onAccentColorChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const filtered = useMemo(
    () =>
      destinations.filter((a) =>
        `${a.label} ${a.detail}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    const previous = document.activeElement as HTMLElement | null;
    setQuery("");
    setHighlighted(0);
    element.showModal();
    input.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen]);
  useEffect(() => {
    if (isOpen)
      document
        .getElementById(`command-${highlighted}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [highlighted, isOpen]);
  const navigate = (item: (typeof destinations)[number]) => {
    onClose();
    if (item.href === "#site-versions") {
      window.setTimeout(openSiteHistory, 60);
      return;
    }
    if (item.external) {
      if (item.href.startsWith("mailto:")) window.location.href = item.href;
      else window.open(item.href, "_blank", "noopener,noreferrer");
    } else void router.push(item.href);
  };
  return (
    <dialog
      ref={dialog}
      className="command-dialog"
      aria-labelledby="command-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="command-content">
        <header className="command-header">
          <h2 id="command-title">command center</h2>
          <button onClick={onClose} aria-label="Close command center">
            <FiX aria-hidden="true" />
          </button>
        </header>
        <div className="command-search">
          <FiSearch aria-hidden="true" />
          <input
            ref={input}
            placeholder="where would you like to go?"
            aria-label="Search commands"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={
              filtered.length ? `command-${highlighted}` : undefined
            }
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlighted((h) =>
                  filtered.length ? (h + 1) % filtered.length : 0,
                );
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlighted((h) =>
                  filtered.length
                    ? (h - 1 + filtered.length) % filtered.length
                    : 0,
                );
              }
              if (e.key === "Enter" && filtered[highlighted]) {
                e.preventDefault();
                navigate(filtered[highlighted]);
              }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <ul
          className="command-results"
          id="command-results"
          role="listbox"
          aria-label="Destinations"
        >
          {filtered.map((item, index) => (
            <li
              key={item.label}
              role="option"
              aria-selected={index === highlighted}
              id={`command-${index}`}
            >
              <button
                onClick={() => navigate(item)}
                onMouseMove={() => setHighlighted(index)}
                tabIndex={-1}
              >
                <span>
                  <span className="command-result-label">
                    {item.label === "github" && <FaGithub aria-hidden="true" />}
                    {item.label === "linkedin" && <FaLinkedin aria-hidden="true" />}
                    {item.label === "x" && <FaXTwitter aria-hidden="true" />}
                    {item.label === "email" && <FaEnvelope aria-hidden="true" />}
                    {item.label}
                  </span>
                  <small>{item.detail}</small>
                </span>
                {item.external ? (
                  <FiArrowUpRight aria-hidden="true" />
                ) : (
                  <FiArrowRight aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
          {!filtered.length && (
            <li className="command-empty" role="presentation">
              no matches. try “projects” or “email”.
            </li>
          )}
        </ul>
        {(onBackgroundChange || onAccentColorChange) && (
          <div className="command-appearance">
            {onBackgroundChange && <ThemeSlider value={background} onChange={onBackgroundChange} />}
            {onAccentColorChange && (
              <div className="command-accent-picker" aria-label="Accent color">
                <span>accent</span>
                <div role="group" aria-label="Choose accent color">
                  {accentColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      aria-label={`${color.name} accent`}
                      aria-pressed={accentColor === color.name}
                      onClick={() => onAccentColorChange(color.name)}
                      style={{ "--accent-swatch": color.value } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <footer className="command-footer">
          <span>↑ ↓ to navigate · enter to open</span>
          <span>⌘ / ctrl K</span>
        </footer>
      </div>
    </dialog>
  );
}
