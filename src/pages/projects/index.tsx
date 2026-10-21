import ProjectImage from "@/components/ProjectImage";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import { projects } from "@/lib/projects";
export default function Projects() {
  return (
    <SiteLayout title="projects" description="Things I have made and shipped.">
      <header className="page-intro">
        <h1>projects.</h1>
        <a href="https://github.com/advayc" className="quiet-link">
          more on github <FiArrowUpRight aria-hidden="true" />
        </a>
      </header>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.slug} className="project-row">
            <Link
              href={`/projects/${project.slug}`}
              className="project-row-copy"
            >
              <div className="project-title-line">
                <h2>{project.title}</h2>
                <time>{project.year}</time>
              </div>
              <p>{project.summary}</p>
              {project.stack && (
                <span className="project-stack">{project.stack}</span>
              )}
              <span className="project-arrow" aria-hidden="true">
                <FiArrowRight />
              </span>
            </Link>
            {project.image && (
              <ProjectImage
                className="project-thumbnail"
                src={project.thumbnail || project.image}
                alt={project.imageAlt || project.title}
                width={project.thumbnailWidth || project.imageWidth || 640}
                height={project.thumbnailHeight || project.imageHeight || 400}
                sizes="(max-width: 540px) calc(100vw - 48px), 260px"
              />
            )}
          </li>
        ))}
      </ul>
    </SiteLayout>
  );
}
