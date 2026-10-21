// Built from the anatomy skill's isometric geometry kit. All coordinates are world-space.
import * as k from "./iso-kit";
export { k };
export const P: k.Projection = {
  origin: [300, 230],
  scale: 1.35,
  azimuth: 45,
  elevation: 30,
};
export const solid = (p: k.SolidPaths, lit = false) =>
  k.solidSvg(p, { tone: "mid", lit });
export const line = (d: string, lit = false) =>
  k.lineSvg(d, { tone: lit ? "lit" : "lo" });
export const box = (
  x: number,
  y: number,
  z: number,
  w: number,
  d: number,
  h: number,
  p = P,
  lit = false,
) => solid(k.slabOf({ x, y, w, d, r: 2 }, z, h, p, 5, 0.6), lit);
export const disc = (
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  p = P,
  lit = false,
) => solid(k.cylinder(x, y, r, z, h, p, 48, 0.5), lit);
export function screw(x: number, y: number, z: number, p = P) {
  return (
    disc(x, y, z, 2.1, 0.6, p) +
    line(k.lineOnTop([x - 1.1, y], [x + 1.1, y], z + 0.7, p))
  );
}
export function board(w = 210, d = 160, p = P) {
  let s = "";
  for (const [x, y] of [
    [-w / 2 + 12, -d / 2 + 12],
    [w / 2 - 12, -d / 2 + 12],
    [-w / 2 + 12, d / 2 - 12],
    [w / 2 - 12, d / 2 - 12],
  ])
    s += disc(x, y, -12, 5, 7, p);
  s +=
    box(-w / 2, -d / 2, -5, w, d, 5, p) +
    line(
      k.planOutline(
        { x: -w / 2 + 4, y: -d / 2 + 4, w: w - 8, d: d - 8, r: 2 },
        0.2,
        p,
      ),
    );
  for (const [x, y] of [
    [-w / 2 + 8, -d / 2 + 8],
    [w / 2 - 8, -d / 2 + 8],
    [-w / 2 + 8, d / 2 - 8],
    [w / 2 - 8, d / 2 - 8],
  ])
    s += screw(x, y, 0.2, p);
  return s;
}
export function topMatrix(z: number, p = P) {
  const a = k.iso([0, 0, z], p),
    x = k.iso([1, 0, z], p),
    y = k.iso([0, 1, z], p);
  return `matrix(${x[0] - a[0]} ${x[1] - a[1]} ${y[0] - a[0]} ${y[1] - a[1]} ${a[0]} ${a[1]})`;
}
export function gearPath(teeth: number, r: number) {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i * Math.PI * 2) / (teeth * 4);
    const rr = i % 4 === 1 || i % 4 === 2 ? r + 2 : r - 2;
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr] as k.Flat);
  }
  return k.pathOf(pts, true);
}
export function chipArt(value: number) {
  let s = board(220, 170);
  s += box(-38, -38, 1, 76, 76, 5);
  for (let i = 0; i < 16; i++) {
    const a = -33 + i * 4.4;
    s +=
      box(a, -48, 1, 2, 10, 2) +
      box(a, 38, 1, 2, 10, 2) +
      box(-48, a, 1, 10, 2, 2) +
      box(38, a, 1, 10, 2, 2);
  }
  s += box(-35, -35, 6, 70, 70, 6);
  s += line(k.planOutline({ x: -31, y: -31, w: 62, d: 62, r: 3 }, 12.1, P));
  s += `<g transform="${topMatrix(12.3)}"><text x="0" y="3" text-anchor="middle" class="chip-engraving">ATmega128</text><circle cx="-26" cy="-26" r="2" class="system-pin"/></g>`;
  for (let i = 0; i < 8; i++) {
    const x = -76 + i * 21;
    s += line(
      k.onTop(
        [
          [x, 60],
          [x, 51],
          [-30 + i * 8, 51],
          [-30 + i * 8, 48],
        ],
        1,
        P,
      ),
    );
    s += disc(x, 64, 1, 5, 3, P, Boolean(value & (1 << i)));
    s += box(x - 5, 72, 0, 10, 3, 2);
  }
  for (let i = 0; i < 7; i++) {
    s +=
      box(-85, -48 + i * 12, 1, 10, 5, 3) + box(68, -50 + i * 10, 1, 13, 4, 2);
  }
  s += box(-22, -74, 0, 44, 14, 6);
  for (let i = 0; i < 8; i++) s += box(-18 + i * 5, -72, 6, 2, 10, 3);
  s += box(-77, -72, 0, 22, 12, 5);
  for (let i = 0; i < 4; i++) s += screw(-74 + i * 5, -66, 5);
  return s;
}
