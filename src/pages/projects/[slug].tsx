import type { GetStaticPaths, GetStaticProps } from "next";
import ProjectImage from "@/components/ProjectImage";
import ProjectVideo from "@/components/ProjectVideo";
import GqSlides from "@/components/projects/GqSlides";
import NumsShowcase from "@/components/projects/NumsShowcase";
import Link from "next/link";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { projects, type Project } from "@/lib/projects";

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <SiteLayout title={project.title} description={project.summary} wide>
      <Link className="back-link" href="/projects">
        <FiArrowLeft aria-hidden="true" /> all projects
      </Link>
      <article className="project-article">
        <header className="page-intro">
          <div className="project-title-line">
            <h1>{project.title}</h1>
            <time>{project.year}</time>
          </div>
          <p>{project.summary}</p>
          <div className="project-links">
            {project.url && (
              <a href={project.url}>
                {project.urlLabel || "visit project"} <FiArrowUpRight aria-hidden="true" />
              </a>
            )}
            {project.links?.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label} <FiArrowUpRight aria-hidden="true" />
              </a>
            ))}
            {project.github && (
              <a href={project.github}>
                {project.githubLabel || "source code"} <FiArrowUpRight aria-hidden="true" />
              </a>
            )}
          </div>
        </header>
        {project.image && (
          <figure
            className={`project-demo${project.slug === "spy" ? " phone-demo" : ""}${project.slug === "67-detector" ? " photo-demo" : ""}${project.slug === "wrapped" ? " wrapped-demo-crop" : ""}${project.slug === "miway-leaderboard" ? " miway-demo" : ""}`}
          >
            {project.slug === "sitemaker" ? (
              <ProjectVideo
                src="/projects/sitemaker-demo.mp4"
                webmSrc="/projects/sitemaker-demo.webm"
                poster="/projects/sitemaker-demo.png"
                alt={project.imageAlt || project.title}
              />
            ) : (
              <ProjectImage
                className="project-hero-image"
                lightboxClassName={project.slug === "wrapped" ? "wrapped-lightbox" : undefined}
                src={project.image || ""}
                alt={project.imageAlt || project.title}
                width={project.imageWidth || 1440}
                height={project.imageHeight || 900}
                sizes="(max-width: 740px) calc(100vw - 48px), (max-width: 1200px) 90vw, 1040px"
              />
            )}
            <figcaption>
              {project.slug === "sitemaker" ? (
                <>
                  a live product walkthrough ·{" "}
                  <a href="https://github.com/advayc/sitemaker/blob/main/public/sitemaker_demo_video.mp4">
                    original project video
                  </a>
                  {" · "}<a href="/projects/sitemaker-demo-hq.gif" download>gif version</a>
                </>
              ) : (
                project.imageCaption || `${project.title} — project preview`
              )}
            </figcaption>
          </figure>
        )}
        <section className="project-description">
          <h2>about the project</h2>
          {project.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {project.stack && (
            <div className="built-with">
              <span>built with</span>
              <span>{project.stack}</span>
            </div>
          )}
        </section>
        {project.slug === "wrapped" && (
          <section className="wrapped-how" aria-labelledby="wrapped-how-title">
            <h2 id="wrapped-how-title">how it works</h2>
            <ol>
              <li>
                <span aria-hidden="true">01</span>
                <div>
                  <h3>run one command</h3>
                  <p>
                    Run one <code>curl</code> command in Terminal. It starts the
                    Go program with <code>go run</code>, so there is no separate
                    script to install or save. Wrapped reads{" "}
                    <code>~/Library/Messages/chat.db</code> and Address Book
                    contacts to match messages with names.
                  </p>
                </div>
              </li>
              <li>
                <span aria-hidden="true">02</span>
                <div>
                  <h3>pick a timeframe</h3>
                  <p>
                    Choose a timeframe and Wrapped analyzes message totals,
                    reply times, streaks, double texts, and more. It turns the
                    collected data into a self-contained HTML slideshow.
                  </p>
                </div>
              </li>
            </ol>
          </section>
        )}
        {project.slug === "gq-planets" && <GqSlides />}
        {project.slug === "nums" && <NumsShowcase />}
        {project.gallery && (
          <div
            className={`project-gallery${project.slug === "spy" ? " phone-gallery" : ""}`}
          >
            {project.gallery.map((item) => (
              <figure key={item.src}>
                <ProjectImage
                  src={item.src}
                  alt={item.alt}
                  width={item.width || 1200}
                  height={item.height || 800}
                  sizes="(max-width: 740px) 90vw, 680px"
                />
                <figcaption>{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </article>
    </SiteLayout>
  );
}
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: projects.map((p) => ({ params: { slug: p.slug } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const index = projects.findIndex((p) => p.slug === params?.slug);
  if (index === -1) return { notFound: true };
  return {
    props: {
      project: projects[index],
    },
  };
};
