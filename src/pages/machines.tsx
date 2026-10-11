import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState, type CSSProperties } from "react";

const GpuFigure = dynamic(() => import("@/components/anatomy/GpuFigure"), { ssr: false });
const DijkstraFigure = dynamic(() => import("@/components/anatomy/DijkstraFigure"), { ssr: false });

function Card({ n, title, hint, readout, children, theme }: {
  n: string; title: string; hint: string; readout: string;
  children: React.ReactNode; theme: "dark" | "paper";
}) {
  return (
    <figure className="iso-figure" style={{ margin: "28px 0 34px" }}>
      <div className="iso-plate" data-theme={theme === "paper" ? "paper" : undefined}>
        <div className="iso-plate-corners" aria-hidden="true">
          <span className="iso-plate-corner" data-corner="fig">{n}</span>
          <span className="iso-plate-corner" data-corner="title">{title}</span>
          <span className="iso-plate-corner" data-corner="hint">{hint}</span>
          <span className="iso-plate-corner" data-corner="readout">{readout}</span>
        </div>
        {children}
      </div>
    </figure>
  );
}

export default function Machines() {
  const [theme, setTheme] = useState<"dark" | "paper">("dark");
  useEffect(() => {
    try {
      const s = window.localStorage.getItem("machinesTheme");
      if (s === "paper" || s === "dark") setTheme(s);
    } catch {}
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem("machinesTheme", theme); } catch {}
  }, [theme]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t" && !(e.metaKey || e.ctrlKey)) setTheme((t) => (t === "dark" ? "paper" : "dark"));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const dark = theme === "dark";
  const style = {
    "--anatomy-card": dark ? "#131313" : "#f4f1ea",
    "--anatomy-paper": dark ? "#131313" : "#f4f1ea",
    background: dark ? "#0b0b0b" : "#f4f1ea",
    color: dark ? "#e6e6e6" : "#1c1a17",
  } as CSSProperties;

  return (
    <main className="iso" data-theme={dark ? undefined : "paper"} style={style}>
      <Head>
        <title>how machines think — gpu + dijkstra | advayc</title>
        <meta name="description" content="Two interactive anatomy figures: how a GPU shades in parallel, and how Dijkstra finds the shortest path." />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 80px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <Link href="/" style={{ fontSize: 13, color: "var(--anatomy-muted)", textDecoration: "none" }}>← advayc</Link>
            <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(34px,5vw,54px)", letterSpacing: "-0.04em", lineHeight: 1 }}>
              how machines think.
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "var(--anatomy-muted)", fontSize: 16, lineHeight: 1.5 }}>
              Two anatomy figures. Object is explanation — no boxes-and-arrows.
              Fig 1 is SVG + WebGL: a tile-painting factory that <i>is</i> a GPU.
              Fig 2 is SVG: a hill relay office that <i>is</i> Dijkstra.
            </p>
          </div>
          <button type="button" onClick={() => setTheme((t) => (t === "dark" ? "paper" : "dark"))}
            aria-label="Toggle dark and paper theme"
            style={{ fontSize: 12, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--anatomy-mid)", background: "var(--anatomy-card)", color: "var(--anatomy-strong)", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {dark ? "☾ dark → paper (T)" : "☀ paper → dark (T)"}
          </button>
        </header>

        <section aria-labelledby="gpu-h" style={{ marginTop: 36 }}>
          <h2 id="gpu-h" style={{ fontSize: 22, margin: "0 0 4px" }}>Fig 1 — the GPU paints in parallel</h2>
          <p style={{ margin: 0, color: "var(--anatomy-muted)", fontSize: 14, maxWidth: 700 }}>
            Dispatcher gantry is scheduler. 16 presses are shader cores. VRAM shelf holds triangles,
            screen shows tiles as they finish. Heat glow is WebGL in same iso camera, between back and front SVG.
          </p>
          <Card n="Fig 1" title="tile-painting factory · GPU" hint="drag workload · space dispatch · hover core · C cpu/gpu"
            readout="16 cores · live" theme={theme}>
            <GpuFigure theme={theme} />
          </Card>
          <div className="iso-legend">
            <div className="iso-keys">
              <span className="iso-key"><svg className="iso-swatch" data-mark="lit" viewBox="0 0 16 10"><path d="M1 8 L8 2 L15 8" /></svg>working core / tile</span>
              <span className="iso-key"><svg className="iso-swatch" data-mark="flat" viewBox="0 0 16 10"><path d="M1 8 L8 2 L15 8" /></svg>idle bench</span>
              <span className="iso-key"><svg className="iso-swatch" data-mark="dashed" viewBox="0 0 16 10"><path d="M1 5 H15" /></svg>dispatched triangle</span>
            </div>
            <p style={{ margin: 0 }}>
              Truth: 1 triangle ≈ 1,200 pixels here. GPU frame ≈ ceil(tris/16)×0.9ms + 1.1ms dispatch;
              CPU ≈ tris×3.2ms on 4 cores. Toggle C to feel ~10× gap grow with workload.
              Numbers drive glow, carriage, pixels — one model, no disagreement.
            </p>
          </div>
        </section>

        <section aria-labelledby="dj-h" style={{ marginTop: 44 }}>
          <h2 id="dj-h" style={{ fontSize: 22, margin: "0 0 4px" }}>Fig 2 — Dijkstra walks the closest hut first</h2>
          <p style={{ margin: 0, color: "var(--anatomy-muted)", fontSize: 14, maxWidth: 700 }}>
            Each rope is an edge; bead count is its cost. Surveyor always visits closest
            unvisited hut next. First time a hut is visited, cheapest route there is known.
          </p>
          <Card n="Fig 2" title="hill relay office · dijkstra" hint="click huts = start/end · space play · N step · R reset"
            readout="pure svg · live" theme={theme}>
            <DijkstraFigure />
          </Card>
          <div className="iso-legend">
            <div className="iso-keys">
              <span className="iso-key"><svg className="iso-swatch" data-mark="lit" viewBox="0 0 16 10"><path d="M1 5 H15" /></svg>shortest path</span>
              <span className="iso-key"><svg className="iso-swatch" data-mark="flat" viewBox="0 0 16 10"><path d="M1 5 H15" /></svg>settled hut/rope</span>
              <span className="iso-key"><svg className="iso-swatch" data-mark="dotted" viewBox="0 0 16 10"><path d="M1 5 H15" /></svg>beads = cost</span>
            </div>
            <p style={{ margin: 0 }}>
              Play it: watch forge (cost 1 from market) settle before far huts even though discovered later.
              That is whole algorithm — greedy by distance, correct with non-negative weights.
            </p>
          </div>
        </section>

        <footer style={{ marginTop: 56, borderTop: "1px solid var(--anatomy-faint)", paddingTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 13, color: "var(--anatomy-muted)" }}>
          <span>built with anatomy skill · svg + webgl in one iso camera · <Link href="/" style={{ color: "inherit" }}>back home</Link></span>
          <span style={{ fontFamily: "var(--anatomy-mono)", fontSize: 11 }}>T toggles theme · figures pause offscreen · still under reduced-motion</span>
        </footer>
      </div>
    </main>
  );
}
