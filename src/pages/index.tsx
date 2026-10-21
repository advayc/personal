import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import PreviewLink from "@/components/PreviewLink";
import { current, previous } from "@/lib/experience";

export default function Home() {
  return (
    <SiteLayout>
      <section className="introduction" aria-labelledby="intro-heading">
        <div className="intro-top">
          <div>
            <h1 id="intro-heading">hey, i’m advay.</h1>
            <p className="intro-caption">a little about me</p>
          </div>
          <Link
            href="/archive"
            className="portrait"
            aria-label="Explore my old website"
          >
            <Image
              src="/icons/me.png"
              alt="Advay overlooking the mountains"
              width={136}
              height={136}
              priority
            />
            <Image
              src="/icons/me-asci.png"
              alt=""
              width={136}
              height={136}
              className="portrait-ascii"
            />
            <span className="portrait-home">home</span>
          </Link>
        </div>
        <div className="intro-writing">
          <p>
            i’m studying computer engineering at{" "}
            <PreviewLink
              href="https://www.queensu.ca/engineering/"
              title="queen’s university"
              description="computer engineering · kingston, ontario"
              image="/experiences/queenseng.png"
            >
              queen’s university
            </PreviewLink>{" "}
            and working on ai prototyping at{" "}
            <PreviewLink
              href="https://magichour.ai/"
              title="magic hour"
              description="ai tools for voice, video, and image generation"
              image="/experiences/magichour.png"
            >
              magic hour
            </PreviewLink>
            .
          </p>
          <p>i like building things and solving problems.</p>
          <ul className="intro-achievements">
            <li>
              At 17, I solved six{" "}
              <PreviewLink
                href="https://www.janestreet.com/puzzles/archive/"
                title="Jane Street puzzles"
                description="Monthly puzzles and past solutions."
              >
                Jane Street puzzles
              </PreviewLink>{" "}
              in a row. A post about it passed 500,000 views on{" "}
              <PreviewLink
                href="https://x.com/advay_c/status/2109717441349640238"
                title="six puzzles, one streak"
                description="More than 500,000 views on X."
              >
                X
              </PreviewLink>
              .
            </li>
            <li>
              At 16, I won a NASA hackathon with an exoplanet detection tool.{" "}
              <Link href="/projects/gq-planets">
                GQ Planets <FiArrowUpRight aria-hidden="true" />
              </Link>
            </li>
            <li>i’ve spent a lot of time building robots with friends.</li>
          </ul>
        </div>
        <nav className="social-links" aria-label="Social links">
          <a href="mailto:advay.chandorkar@gmail.com">
            email <FiArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://www.linkedin.com/in/advay/">
            linkedin <FiArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://github.com/advayc">
            github <FiArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://x.com/advay_c">
            x <FiArrowUpRight aria-hidden="true" />
          </a>
        </nav>
      </section>
      <section
        className="experience-section"
        id="experience"
        aria-labelledby="experience-heading"
      >
        <div className="section-heading">
          <h2 id="experience-heading">experience</h2>
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
            résumé <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <h3 className="group-label">now</h3>
        <ul className="experience-list">
          {current.map((item) => (
            <li key={item.title}>
              <a href={item.href} className="experience-row">
                <Image src={item.imageSrc} alt="" width={32} height={32} />
                <span>
                  <span className="experience-title">{item.title}</span>
                  <span className="experience-detail">
                    {item.detail
                      .replace("incoming student · ", "")
                      .replace(" 📍", "")}
                  </span>
                </span>
                <span className="experience-year">{item.year}</span>
              </a>
            </li>
          ))}
        </ul>
        <h3 className="group-label previous-label">before</h3>
        <ul className="experience-list">
          {previous.map((item) => (
            <li key={item.title}>
              <a href={item.href} className="experience-row">
                <Image src={item.imageSrc} alt="" width={32} height={32} />
                <span>
                  <span className="experience-title">{item.title}</span>
                  <span className="experience-detail">{item.detail}</span>
                </span>
                <span className="experience-year">{item.year}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="home-projects" aria-labelledby="projects-heading">
        <div className="section-heading">
          <h2 id="projects-heading">projects</h2>
          <Link href="/projects">
            all projects <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="home-more">
          <Link href="/systems">
            systems i find interesting <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
