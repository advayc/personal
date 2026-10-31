/** Register a Markdown article here to publish it on /writing. */
export type WritingEntry = {
  slug: string;
  title: string;
  markdownFile: string;
  date?: string;
  summary?: string;
  pdfFile?: string;
};

export const writings: WritingEntry[] = [
  {
    slug: "lossy-compression",
    title: "Lossy Compression Algorithms",
    markdownFile: "lossy-compression.md",
    date: "2026-10-22",
    summary: "Essay on Lossy Compression Algorithms (modified my ib EE)",
    pdfFile: "/ee.pdf",
  },
];

export function getWriting(slug: string) {
  return writings.find((entry) => entry.slug === slug);
}
