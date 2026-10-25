/** Register a Markdown article here to publish it on /writing. */
export type WritingEntry = {
  slug: string;
  title: string;
  markdownFile: string;
  date?: string;
  summary?: string;
};

export const writings: WritingEntry[] = [
  {
    slug: "card-math",
    title: "Making 6,843 with playing cards",
    markdownFile: "card-math.md",
    date: "2026-10-22",
    summary: "How Scott Wu makes 6,843 from eight cards, with a step-by-step proof and a solver to try yourself.",
  },
  {
    slug: "lossy-compression",
    title: "Lossy Compression Algorithms",
    markdownFile: "lossy-compression.md",
    date: "2026-10-22",
    summary: "Essay on Lossy Compression Algorithms (modified my ib EE)",
  },
];

export function getWriting(slug: string) {
  return writings.find((entry) => entry.slug === slug);
}
