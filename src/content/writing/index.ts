import type { ComponentType } from "react";

/** Register a TSX article here to publish it on /writing. */
export type WritingEntry = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  Article: ComponentType;
};

export const writings: WritingEntry[] = [];

export function getWriting(slug: string) {
  return writings.find((entry) => entry.slug === slug);
}
