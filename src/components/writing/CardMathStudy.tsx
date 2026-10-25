import { useEffect, useMemo, useRef, useState } from "react";
import { dealSolvableCards, expressionSteps, solveCardPuzzle } from "./cardMath";

const demonstration = [
  { equation: "6843 = 3 × 2281", result: "Reserve the 3. Now build 2,281.", active: [] as number[] },
  { equation: "12 − 10 = 2", result: "Start with a small difference.", active: [0, 1] },
  { equation: "2 × 10 = 20", result: "Use the second 10.", active: [0, 1, 2] },
  { equation: "20 × 10 = 200", result: "Use the third 10.", active: [0, 1, 2, 3] },
  { equation: "200 + 8 = 208", result: "Now we are one step from 2,288.", active: [0, 1, 2, 3, 4] },
  { equation: "208 × 11 = 2288", result: "The large factor does most of the work.", active: [0, 1, 2, 3, 4, 5] },
  { equation: "2288 − 7 = 2281", result: "Subtract 7 to reach the reserved factor.", active: [0, 1, 2, 3, 4, 5, 6] },
  { equation: "2281 × 3 = 6843", result: "Every card has now been used exactly once.", active: [0, 1, 2, 3, 4, 5, 6, 7] },
];

const filmCards = [
  { value: 12, face: "Q", suit: "♠" },
  { value: 10, face: "10", suit: "♦" },
  { value: 10, face: "10", suit: "♣" },
  { value: 10, face: "10", suit: "♥" },
  { value: 8, face: "8", suit: "♠" },
  { value: 11, face: "J", suit: "♦" },
  { value: 7, face: "7", suit: "♣" },
  { value: 3, face: "3", suit: "♥" },
];

const solverSuits = ["♠", "♥", "♣", "♦"];

const pipLayouts: Record<number, [number, number][]> = {
  2: [[50, 18], [50, 82]],
  3: [[50, 18], [50, 50], [50, 82]],
  4: [[28, 22], [72, 22], [28, 78], [72, 78]],
  5: [[28, 22], [72, 22], [50, 50], [28, 78], [72, 78]],
  6: [[28, 18], [72, 18], [28, 50], [72, 50], [28, 82], [72, 82]],
  7: [[28, 18], [72, 18], [50, 34], [28, 50], [72, 50], [28, 82], [72, 82]],
  8: [[28, 18], [72, 18], [50, 34], [28, 50], [72, 50], [50, 66], [28, 82], [72, 82]],
  9: [[28, 18], [72, 18], [50, 34], [28, 50], [50, 50], [72, 50], [50, 66], [28, 82], [72, 82]],
  10: [[28, 16], [72, 16], [50, 30], [28, 39], [72, 39], [28, 61], [72, 61], [50, 70], [28, 84], [72, 84]],
};

const suitDots: Record<string, string[]> = {
  "♠": ["...●...", "..●●●..", ".●●●●●.", "●●●●●●●", ".●●●●●.", "..●●●..", ".●●●●●."],
  "♥": [".●●.●●.", "●●●●●●●", "●●●●●●●", ".●●●●●.", "..●●●..", "...●...", "......."],
  "♣": ["..●●●..", "..●●●..", "●●●●●●●", "●●●●●●●", ".●●●●●.", "..●●●..", ".●●●●●."],
  "♦": ["...●...", "..●●●..", ".●●●●●.", "●●●●●●●", ".●●●●●.", "..●●●..", "...●..."],
};

function DotSuit({ suit }: { suit: string }) {
  return <svg className="math-dot-suit" viewBox="0 0 7 7" aria-hidden="true">
    {suitDots[suit].flatMap((row, y) => Array.from(row, (mark, x) => mark === "●" ? <circle key={`${x}-${y}`} cx={x + .5} cy={y + .5} r=".45" fill="currentColor" /> : null))}
  </svg>;
}

const courtColors = { ink: "#243a43", red: "#b44735", gold: "#c79537", skin: "#dfc59b", teal: "#53888a", dust: "#d9d3c5" };

function courtColor(x: number, y: number, rank: string): string | null {
  const dx = Math.abs(x - 12);
  if (rank === "J") {
    if (y === 2 && x >= 14 && x <= 19) return courtColors.gold;
    if (y >= 3 && y <= 5 && x >= 5 && x <= 18) return (x + y) % 4 === 0 ? courtColors.gold : courtColors.teal;
    if (y === 6 && dx <= 7) return courtColors.ink;
  } else {
    if (y === 1 && [6, 12, 18].includes(x)) return courtColors.gold;
    if (y === 2 && dx <= 7 && (x % 2 === 0 || dx === 5)) return courtColors.gold;
    if (y >= 3 && y <= 5 && dx <= 7) return dx === 7 ? courtColors.ink : (x + y) % 5 === 0 ? courtColors.red : courtColors.gold;
    if (y === 6 && dx <= 6) return courtColors.ink;
  }

  const head = ((x - 12) / 6.3) ** 2 + ((y - 13) / 8) ** 2 <= 1;
  if (head && y >= 7 && y <= 20) {
    if (dx >= 5 || y <= 8) return rank === "Q" ? courtColors.red : courtColors.ink;
    if (y === 12 && [10, 14].includes(x)) return courtColors.ink;
    if (y === 15 && x === 12) return courtColors.gold;
    if (y === 17 && dx <= 1) return courtColors.red;
    if (rank === "K" && y >= 18 && dx <= 3) return (x + y) % 4 === 0 ? courtColors.gold : courtColors.ink;
    return (x + y) % 7 === 0 ? courtColors.gold : courtColors.skin;
  }
  if (y >= 20 && y <= 22 && dx <= 3) return courtColors.skin;

  const robeWidth = 4 + Math.floor((y - 21) * .85);
  if (y >= 21 && y <= 31 && dx <= robeWidth) {
    if (dx === robeWidth) return courtColors.ink;
    if (dx <= 1 || y === 22) return courtColors.gold;
    if ((x - y + 40) % 8 === 0 || (x + y) % 11 === 0) return courtColors.gold;
    if ((x * 3 + y) % 17 === 0) return courtColors.skin;
    return x < 12 ? (rank === "Q" ? courtColors.teal : courtColors.red) : (rank === "Q" ? courtColors.red : courtColors.teal);
  }
  return (x * 17 + y * 11) % 31 === 0 ? courtColors.dust : null;
}

function DotCourt({ rank }: { rank: string }) {
  return <svg className="math-dot-court" viewBox="0 0 75 96" aria-hidden="true">
    {Array.from({ length: 32 }, (_, y) => Array.from({ length: 25 }, (_, x) => {
      const fill = courtColor(x, y, rank);
      return fill ? <circle key={`${x}-${y}`} cx={x * 3 + 1.5} cy={y * 3 + 1.5} r={(x + y) % 5 === 0 ? 1.2 : 1.05} fill={fill} /> : null;
    }))}
  </svg>;
}

function PlayingCard({ value, face, suit, active }: { value: number; face?: string; suit: string; active?: boolean }) {
  const displayValue = face || ({ 1: "A", 11: "J", 12: "Q", 13: "K" } as Record<number, string>)[value] || value;
  const suitName = ({ "♠": "spades", "♥": "hearts", "♣": "clubs", "♦": "diamonds" } as Record<string, string>)[suit];
  return (
    <div className={`math-card ${suit === "♥" || suit === "♦" ? "is-red" : ""} ${active ? "is-active" : ""}`} role="img" aria-label={`${displayValue} of ${suitName}, value ${value}`}>
      <span className="math-card-inset" aria-hidden="true" />
      <span className="math-card-corner is-top-left" aria-hidden="true"><strong>{displayValue}</strong><DotSuit suit={suit} /></span>
      <span className="math-card-corner is-top-right" aria-hidden="true"><strong>{displayValue}</strong><DotSuit suit={suit} /></span>
      <span className="math-card-center" aria-hidden="true">
        {value === 1 ? <span className="math-card-ace"><DotSuit suit={suit} /></span> :
          value > 10 ? <span className="math-card-portrait"><DotCourt rank={String(displayValue)} /><small>{value}</small></span> :
          <span className="math-card-pips">{pipLayouts[value]?.map(([x, y], index) => <span key={index} style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%)${y > 50 ? " rotate(180deg)" : ""}` }}><DotSuit suit={suit} /></span>)}</span>}
      </span>
      <span className="math-card-corner is-bottom-left" aria-hidden="true"><strong>{displayValue}</strong><DotSuit suit={suit} /></span>
      <span className="math-card-corner is-bottom-right" aria-hidden="true"><strong>{displayValue}</strong><DotSuit suit={suit} /></span>
    </div>
  );
}

export default function CardMathStudy() {
  const [step, setStep] = useState(0);
  const [cards, setCards] = useState([9, 9, 5, 5]);
  const [target, setTarget] = useState(2025);
  const [query, setQuery] = useState({ cards: [9, 9, 5, 5], target: 2025 });
  const [shuffleNote, setShuffleNote] = useState("");
  const [shufflePhase, setShufflePhase] = useState<"idle" | "gather" | "deal">("idle");
  const shuffleTimers = useRef<number[]>([]);
  const solution = useMemo(() => solveCardPuzzle(query.cards, query.target), [query]);
  const steps = useMemo(() => solution ? expressionSteps(solution) : [], [solution]);

  useEffect(() => () => shuffleTimers.current.forEach(window.clearTimeout), []);

  function applyPreset(values: number[], goal: number) {
    shuffleTimers.current.forEach(window.clearTimeout);
    shuffleTimers.current = [];
    setShufflePhase("idle");
    setCards(values);
    setTarget(goal);
    setQuery({ cards: values, target: goal });
    setShuffleNote("");
  }

  function shuffleCards() {
    if (shufflePhase !== "idle") return;
    const next = dealSolvableCards(target, cards);
    const reveal = () => {
      setCards(next.cards);
      setTarget(next.target);
      setQuery({ cards: next.cards, target: next.target });
      setShuffleNote(next.adjusted ? `No four-card deal reaches ${target.toLocaleString()}, so the target changed to 24.` : "");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }
    setShufflePhase("gather");
    shuffleTimers.current = [
      window.setTimeout(() => {
        reveal();
        setShufflePhase("deal");
      }, 390),
      window.setTimeout(() => setShufflePhase("idle"), 900),
    ];
  }

  const current = demonstration[step];
  return (
    <div className="card-math-study">
      <section className="card-proof" aria-label="6,843 card proof">
        <div className="card-study-head"><span>01 / the demonstration</span><span>8 cards · 7 moves</span></div>
        <div className="math-card-row" aria-label="The eight card values used in the proof">
          {filmCards.map((card, index) => <PlayingCard key={index} {...card} active={current.active.includes(index)} />)}
        </div>
        <div className="card-step" aria-live="polite">
          <span className="card-step-index">{String(step + 1).padStart(2, "0")} / 08</span>
          <div><strong>{current.equation}</strong><p>{current.result}</p></div>
        </div>
        <div className="card-proof-controls">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Previous</button>
          <div className="card-step-dots" aria-label="Proof progress">{demonstration.map((_, index) => <span key={index} className={index <= step ? "is-complete" : ""} />)}</div>
          <button type="button" onClick={() => setStep(Math.min(demonstration.length - 1, step + 1))} disabled={step === demonstration.length - 1}>Next →</button>
        </div>
      </section>

      <section className="card-solver" aria-label="Solve a four card puzzle">
        <div className="card-study-head"><span>02 / try the algorithm</span><span>4 cards · exact arithmetic</span></div>
        <p className="card-solver-intro">Pick four values (A = 1, J = 11, Q = 12, K = 13). Use each once to reach the target. Shuffle deals a solvable set.</p>
        <div className={`card-solver-cards is-${shufflePhase}`}>
          {cards.map((value, index) => (
            <label key={index} className="card-input-wrap" style={{ "--shuffle-x": `${(1.5 - index) * 78}px`, "--shuffle-tilt": `${index % 2 ? 11 : -11}deg`, "--shuffle-delay": `${index * 25}ms` } as React.CSSProperties}>
              <PlayingCard value={value} suit={solverSuits[index]} />
              <span>Card {index + 1}</span>
              <input aria-label={`Card ${index + 1} value`} type="number" min="1" max="13" value={value} disabled={shufflePhase !== "idle"} onChange={(event) => setCards(cards.map((card, position) => position === index ? Number(event.target.value) : card))} />
            </label>
          ))}
        </div>
        <form className="card-solver-form" onSubmit={(event) => { event.preventDefault(); if (cards.every((card) => Number.isInteger(card) && card >= 1 && card <= 13) && Number.isSafeInteger(target)) { setQuery({ cards: [...cards], target }); setShuffleNote(""); } }}>
          <label>Target <input type="number" min="-99999" max="99999" value={target} disabled={shufflePhase !== "idle"} onChange={(event) => setTarget(Number(event.target.value))} /></label>
          <button type="submit" disabled={shufflePhase !== "idle"}>Find a solution →</button>
        </form>
        <div className="card-presets"><span>Examples</span><button type="button" disabled={shufflePhase !== "idle"} onClick={() => applyPreset([9, 9, 5, 5], 2025)}>2025</button><button type="button" disabled={shufflePhase !== "idle"} onClick={() => applyPreset([6, 4, 2, 1], 24)}>24</button><button type="button" disabled={shufflePhase !== "idle"} onClick={shuffleCards}>Shuffle cards ↻</button></div>
        {shuffleNote && <p className="card-shuffle-note" role="status">{shuffleNote}</p>}
        <div className="card-solver-result" aria-live="polite">
          {solution ? <><span className="card-result-label">A solution</span><strong>{solution.text.slice(1, -1)} = {query.target}</strong><ol>{steps.map((line, index) => <li key={index}>{line}</li>)}</ol></> : <><span className="card-result-label">No solution found</span><p>Try a different target or set of cards. This solver keeps all intermediate results as integers.</p></>}
        </div>
      </section>
    </div>
  );
}
