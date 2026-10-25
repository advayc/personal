import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import SiteLayout from "@/components/SiteLayout";
import PreviewLink from "@/components/PreviewLink";
import SiteHistoryTrigger from "@/components/SiteHistoryTrigger";
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
          <SiteHistoryTrigger
            className="portrait"
            aria-label="Explore versions of my website"
            aria-haspopup="dialog"
          >
            <div className="portrait-wrapper">
              <Image
                src="/icons/fast/me.webp"
                alt="Advay overlooking the mountains"
                width={136}
                height={136}
                priority
              />
              <Image
                src="/icons/fast/me-asci.webp"
                alt=""
                width={136}
                height={136}
                className="portrait-ascii"
              />
            </div>
            <span className="portrait-home">site versions</span>
          </SiteHistoryTrigger>
        </div>
        <div className="intro-writing">
          <p>
            i’m studying computer engineering at{" "}
            <PreviewLink
              href="https://www.queensu.ca/engineering/"
              title="queen’s university"
              description="computer engineering · kingston, ontario"
              image="/experiences/fast/queenseng.webp"
            >
              queen’s university
            </PreviewLink>{" "}
            and working on ai prototyping for diffusion models at{" "}
            <PreviewLink
              href="https://magichour.ai/"
              title="magic hour"
              description="ai tools for voice, video, and image generation"
              image="/experiences/fast/magichour.webp"
            >
              magic hour
            </PreviewLink>
            .
          </p>
          <p>
            i like building things and{" "}
            <PreviewLink
              href="https://dmoj.ca/user/advayc"
              title="DMOJ · advayc"
              description="Competitive programming profile"
              variant="dmoj"
              previewContent={
                <span className="dmoj-card">
                  <span className="dmoj-card-heading">
                    <span>
                      <a
                        href="https://dmoj.ca/user/advayc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dmoj-account-link"
                      >
                        <strong>my account</strong>
                      </a>
                      <small>advayc on DMOJ</small>
                    </span>
                    <FiArrowUpRight aria-hidden="true" />
                  </span>
                <span className="dmoj-avatar">
                  <Image
                    src="/dmoj-avatar.png"
                    alt="Advay's pixel-art monkey avatar on DMOJ"
                    width={120}
                    height={120}
                    loading="lazy"
                  />
                </span>
                  <span className="dmoj-card-stats">
                    <span><strong>242</strong> problems solved</span>
                    <span><strong>rank by points</strong> #825</span>
                    <span><strong>total points</strong> 382</span>
                  </span>
                  <span className="dmoj-card-contests">
                    <span><strong>4</strong> contests written</span>
                    <span><strong>rank by rating</strong> #2513</span>
                  </span>
                  <span className="dmoj-card-ratings">
                    <span><strong>rating</strong><i className="dmoj-rating-circle" aria-hidden="true" /><em>1378</em></span>
                    <span><strong>min. rating</strong><i className="dmoj-rating-circle dmoj-min-circle" aria-hidden="true" /><em>1037</em></span>
                    <span><strong>max rating</strong><i className="dmoj-rating-circle dmoj-peak-circle" aria-hidden="true" /><em>1599</em></span>
                  </span>
                </span>
              }
            >
              solving problems
            </PreviewLink>, most
            recently i’ve:
          </p>
          <ul className="intro-achievements">
            <li>
              won a <Link href="/projects/gq-planets">NASA</Link> hackathon at 16 with an exoplanet detection
              tool (ml).
            </li>
            <li>
              went viral on{" "}
              <PreviewLink
                href="https://x.com/advay_c/status/2109717441349640238"
                title="6 Jane Street puzzles in a row"
                description="The streak that reached more than 500,000 views."
              >
                X
              </PreviewLink>{" "}
              (500k+ views) after solving 6{" "}
              <PreviewLink
                href="https://www.janestreet.com/puzzles/archive/"
                title="Jane Street puzzles"
                description="Monthly puzzles and past solutions."
              >
                Jane Street puzzles
              </PreviewLink>{" "}in a row at 17 (math)
            </li>
            <li key="ios-app">
              shipped an iOS app in 4 days that reached 5k monthly users after learning mobile dev in a day (typescript/swift)
            </li>
            <li>been programming semi-autonomous robots since i was 13 (c++ / python)</li>
          </ul>
        </div>
        <nav className="social-links" aria-label="Social links">
          <a href="mailto:me@advay.ca">
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
          <a href="/advay_resume.pdf" target="_blank" rel="noopener noreferrer">
            résumé <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <h3 className="group-label">now</h3>
        <ul className="experience-list">
          {current.map((item) => (
            <li key={item.title}>
              <a href={item.href} className="experience-row">
                <Image src={item.imageSrc} alt="" width={32} height={32} loading="lazy" />
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
                <Image src={item.imageSrc} alt="" width={32} height={32} loading="lazy" />
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
