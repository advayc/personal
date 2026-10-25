export const accentColors = [
  { name: "orange", value: "#ff3908" },
  { name: "cyan", value: "#22d3ee" },
  { name: "violet", value: "#a78bfa" },
  { name: "lime", value: "#a3e635" },
  { name: "pink", value: "#f472b6" },
] as const;

export type AccentColor = (typeof accentColors)[number]["name"];
