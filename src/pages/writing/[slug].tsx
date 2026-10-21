import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { getWriting, writings } from "@/content/writing";

export default function WritingArticle({ slug }: { slug: string }) {
  const entry = getWriting(slug);
  if (!entry) return null;
  const { Article } = entry;
  return (
    <SiteLayout title={entry.title} description={entry.summary || entry.title}>
      <Link className="back-link" href="/writing">
        <FiArrowLeft aria-hidden="true" /> all writing
      </Link>
      <article className="writing-article">
        <header>
          <h1>{entry.title}</h1>
          <time dateTime={entry.date}>{entry.date}</time>
        </header>
        <div className="writing-body">
          <Article />
        </div>
      </article>
    </SiteLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: writings.map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug || "");
  return getWriting(slug) ? { props: { slug } } : { notFound: true };
};
