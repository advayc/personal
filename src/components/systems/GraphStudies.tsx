import { useMemo, useState } from "react";
import { k, board, disc, line, screw } from "./geometry";
import { graphNodes, graphEdges, traverse, kruskal } from "./models";
function network(
  p: k.Projection,
  visited: number[],
  accepted: number[] = [],
  weighted = false,
  candidate = -1,
) {
  let s = board(180, 155, p);
  graphEdges.forEach((e, i) => {
    const a = graphNodes[e.a],
      b = graphNodes[e.b];
    const lit = weighted
      ? accepted.includes(i)
      : visited.includes(e.a) && visited.includes(e.b);
    s +=
      `<g class="${i === candidate ? "graph-candidate" : ""}">` +
      line(k.segment([a.x, a.y, 2], [b.x, b.y, 2], p), lit) +
      "</g>";
    if (weighted) {
      const point = k.iso([(a.x + b.x) / 2, (a.y + b.y) / 2, 4], p);
      s += `<g class="edge-weight"><circle cx="${point[0]}" cy="${point[1]}" r="7"/><text x="${point[0]}" y="${point[1] + 2.5}">${e.w}</text></g>`;
    }
  });
  [...graphNodes]
    .sort((a, b) => k.depthOf([a.x, a.y, 0], p) - k.depthOf([b.x, b.y, 0], p))
    .forEach((n) => {
      s +=
        disc(n.x, n.y, 0, 10, 3, p) +
        disc(n.x, n.y, 3, 7, 5, p, visited.includes(n.id)) +
        screw(n.x - 12, n.y, 0, p);
      const a = k.iso([n.x, n.y, 8], p);
      s += `<text x="${a[0]}" y="${a[1] + 3}" text-anchor="middle" class="node-letter">${n.name}</text>`;
    });
  return s;
}
export function SearchComparison() {
  const [step, setStep] = useState(0);
  const [start, setStart] = useState(0);
  const bfs = useMemo(() => traverse("bfs", start), [start]),
    dfs = useMemo(() => traverse("dfs", start), [start]);
  const left: k.Projection = {
    origin: [150, 190],
    scale: 0.95,
    azimuth: 45,
    elevation: 32,
  };
  const right = { ...left, origin: [450, 190] as k.Flat };
  const art =
    network(left, bfs.slice(0, step)) + network(right, dfs.slice(0, step));
  const order = (a: number[]) =>
    a
      .slice(0, step)
      .map((n) => graphNodes[n].name)
      .join(" → ") || "ready";
  return (
    <div className="system-instrument">
      <div className="comparison-labels">
        <span>breadth-first · queue</span>
        <span>depth-first · stack</span>
      </div>
      <svg
        viewBox="0 0 600 330"
        className="iso-svg"
        role="img"
        aria-label={`BFS: ${order(bfs)}. DFS: ${order(dfs)}.`}
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls">
        <button disabled={step === 7} onClick={() => setStep((s) => s + 1)}>
          visit next
        </button>
        <button onClick={() => setStep(0)}>reset</button>
        <label>
          start{" "}
          <select
            aria-label="Search starting node"
            value={start}
            onChange={(e) => {
              setStart(+e.target.value);
              setStep(0);
            }}
          >
            {graphNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="comparison-readout">
        <output>BFS {order(bfs)}</output>
        <output>DFS {order(dfs)}</output>
      </div>
    </div>
  );
}
export function Kruskal() {
  const [step, setStep] = useState(0);
  const states = useMemo(kruskal, []);
  const current = states[step - 1];
  const p: k.Projection = {
    origin: [300, 205],
    scale: 1.55,
    azimuth: 45,
    elevation: 40,
  };
  const art = network(
    p,
    [],
    current?.accepted || [],
    true,
    current?.edge.index ?? -1,
  );
  return (
    <div className="system-instrument">
      <svg
        viewBox="0 0 600 390"
        className="iso-svg"
        role="img"
        aria-label="Weighted network with minimum spanning tree edges highlighted"
        dangerouslySetInnerHTML={{ __html: art }}
      />
      <div className="instrument-controls">
        <button
          disabled={step === states.length}
          onClick={() => setStep((s) => s + 1)}
        >
          test next edge
        </button>
        <button onClick={() => setStep(0)}>reset</button>
      </div>
      <output>
        {current
          ? `${graphNodes[current.edge.a].name}–${graphNodes[current.edge.b].name}: ${current.accept ? "keep" : "skip cycle"} · total weight ${current.weight} · ${current.accepted.length}/6 edges`
          : "sort edges by weight, then connect without cycles"}
      </output>
    </div>
  );
}
