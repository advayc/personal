export const graphNodes = [
  { id: 0, name: "A", x: -66, y: -42 },
  { id: 1, name: "B", x: 0, y: -54 },
  { id: 2, name: "C", x: 66, y: -34 },
  { id: 3, name: "D", x: -68, y: 30 },
  { id: 4, name: "E", x: 0, y: 8 },
  { id: 5, name: "F", x: 64, y: 36 },
  { id: 6, name: "G", x: 0, y: 66 },
];
export const graphEdges = [
  { a: 0, b: 1, w: 4 },
  { a: 0, b: 3, w: 2 },
  { a: 1, b: 2, w: 3 },
  { a: 1, b: 4, w: 6 },
  { a: 3, b: 4, w: 1 },
  { a: 3, b: 6, w: 7 },
  { a: 4, b: 5, w: 2 },
  { a: 4, b: 6, w: 3 },
  { a: 5, b: 6, w: 4 },
  { a: 2, b: 5, w: 5 },
];
export function traverse(mode: "bfs" | "dfs", start = 0) {
  const seen = new Set<number>();
  const order: number[] = [];
  const neighbors = (n: number) =>
    graphEdges
      .flatMap((e) => (e.a === n ? [e.b] : e.b === n ? [e.a] : []))
      .sort((a, b) => a - b);
  if (mode === "dfs") {
    const visit = (n: number) => {
      if (seen.has(n)) return;
      seen.add(n);
      order.push(n);
      neighbors(n).forEach(visit);
    };
    visit(start);
  } else {
    const queue = [start];
    seen.add(start);
    while (queue.length) {
      const n = queue.shift()!;
      order.push(n);
      for (const v of neighbors(n))
        if (!seen.has(v)) {
          seen.add(v);
          queue.push(v);
        }
    }
  }
  return order;
}
export function kruskal() {
  const parent = graphNodes.map((n) => n.id);
  const find = (n: number): number =>
    parent[n] === n ? n : (parent[n] = find(parent[n]));
  let weight = 0;
  const accepted: number[] = [];
  return graphEdges
    .map((e, i) => ({ ...e, index: i }))
    .sort((a, b) => a.w - b.w || a.index - b.index)
    .map((edge) => {
      const a = find(edge.a),
        b = find(edge.b),
        accept = a !== b;
      if (accept) {
        parent[a] = b;
        weight += edge.w;
        accepted.push(edge.index);
      }
      return { edge, accept, weight, accepted: [...accepted] };
    });
}
export const planetRatio = (sun: number, ring: number) => 1 + ring / sun;
export const capacitance = (
  areaCm2: number,
  gapMm: number,
  relativePermittivity = 1,
) =>
  (8.8541878128e-12 * relativePermittivity * areaCm2 * 1e-4) / (gapMm * 1e-3);
export const capacitorCharge = (volts: number, capacitanceFarads: number) =>
  volts * capacitanceFarads;

export type GearLock = "ring" | "carrier" | "sun";
/** Willis: Ns(ws-wc) + Nr(wr-wc) = 0. The sun is input except when locked. */
export function planetarySpeeds(lock: GearLock, input: number) {
  const sun = lock === "sun" ? 0 : input;
  const ring = lock === "ring" ? 0 : lock === "sun" ? input : -input / 3;
  const carrier = (18 * sun + 54 * ring) / 72;
  const planetRelative = -(sun - carrier); // Nsun = Nplanet = 18.
  return {
    sun,
    ring,
    carrier,
    planetRelative,
    planet: carrier + planetRelative,
  };
}
