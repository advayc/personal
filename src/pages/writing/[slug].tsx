import type { GetStaticPaths, GetStaticProps } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { getWriting, writings } from "@/content/writing";
import WritingReader from "@/components/writing/WritingReader";

type Props = { slug: string; markdown: string };

export default function WritingArticle({ slug, markdown }: Props) {
  const entry = getWriting(slug);
  if (!entry) return null;
  return (
    <SiteLayout wide title={entry.title} description={entry.summary || entry.title}>
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
      <WritingReader markdown={markdown} />
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
  return { props: { slug, markdown: readFileSync(markdownPath, "utf8") } };
};
