import styles from "@/components/writing/writing.module.css";
import "katex/dist/katex.min.css";
import type { GetStaticPaths, GetStaticProps } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { getWriting, writings } from "@/content/writing";
import WritingReader from "@/components/writing/WritingReader";

import { compileWriting, type WritingDocument } from "@/lib/compileWriting";

type Props = { slug: string; article: WritingDocument };

export default function WritingArticle({ slug, article }: Props) {
  const entry = getWriting(slug);
  if (!entry) return null;
  return (
    <SiteLayout wide mainClassName={styles.page} title={entry.title} description={entry.summary || entry.title}>
      <div className="writing-tools">
        <Link className="back-link" href="/writing">
          <FiArrowLeft aria-hidden="true" /> all writing
        </Link>
        {entry.date && (
          <time className="writing-date" dateTime={entry.date}>
            {new Date(`${entry.date}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
        )}
      </div>
      <WritingReader article={article} pdfHref={entry.pdfFile} />
    </SiteLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: writings.map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const entry = getWriting(slug);
  if (!entry) return { notFound: true };
  const markdownPath = join(process.cwd(), "src/content/writing", entry.markdownFile);
  return { props: { slug, article: compileWriting(readFileSync(markdownPath, "utf8")) } };
};
