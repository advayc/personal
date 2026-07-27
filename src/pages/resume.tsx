import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import styles from "@/styles/Resume.module.css";

const current = [
  {
    title: "computer engineering at queen's university",
    detail: "incoming student · kingston, on",
    href: "https://www.queensu.ca/engineering/",
  },
  {
    title: "software developer at neurotechuoft",
    detail: "building tools for neurotechnology research",
    href: "https://neurotechuoft.ca/",
  },
  {
    title: "seva eats",
    detail: "connecting gurdwara meals with families who need them",
    href: "https://sevaeats.vercel.app/",
  },
];

const previous = [
  {
    title: "glenforest computer science club",
    detail: "president · contests, workshops, and community",
    href: "https://github.com/glenforestss",
  },
  {
    title: "futuremd",
    detail: "vice president · web development and outreach",
    href: "https://futuremd.net/",
  },
  {
    title: "vex robotics 31331b",
    detail: "team lead · ontario provincial championship",
    href: "https://github.com/advayc/31331B-VRC-High-Stakes",
  },
];

const projects = [
  {
    title: "sitemaker",
    detail: "resume-to-website generator",
    href: "https://sitemaker.advay.ca/",
  },
  {
    title: "spy",
    detail: "open-source party game, shipped to the app store",
    href: "https://spy.advay.ca/",
  },
  {
    title: "gfss calendar",
    detail: "school events platform · 1k+ monthly users",
    href: "https://clubs.advay.ca/",
  },
  {
    title: "gq planets",
    detail: "nasa space apps global nominee",
    href: "https://github.com/DeadUser123/Space-APPS-Hackathon",
  },
  {
    title: "nums",
    detail: "tiny page-view counter written in go",
    href: "https://docs.advay.ca/",
  },
];

type Item = (typeof current)[number];

function ResumeSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className={styles.section} aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} target="_blank" rel="noopener noreferrer">
              <span className={styles.itemTitle}>{item.title}</span>
              <span className={styles.itemDetail}>{item.detail}</span>
              <FaArrowUpRightFromSquare className={styles.arrow} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Resume() {
  return (
    <main className={styles.page}>
      <Head>
        <title>about advay chandorkar</title>
        <meta
          name="description"
          content="A short summary of Advay Chandorkar: developer, computer engineering student, and builder from Toronto."
        />
        <meta name="theme-color" content="#171717" />
      </Head>

      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>hello, i&apos;m</p>
            <h1>advay.</h1>
            <p className={styles.intro}>
              a developer and incoming computer engineering student from toronto. i like
              turning small observations into useful things for real people.
            </p>
          </div>
          <Link className={styles.avatar} href="/" aria-label="Back to home">
            <Image src="/favicon.png" alt="" width={72} height={72} priority />
            <span>home</span>
          </Link>
        </header>

        <ResumeSection title="currently" items={current} />
        <ResumeSection title="previously" items={previous} />
        <ResumeSection title="selected projects" items={projects} />

        <footer className={styles.footer}>
          <nav aria-label="Social links">
            <Link href="mailto:advay.chandorkar@gmail.com" aria-label="Email Advay">
              <MdEmail />
            </Link>
            <Link href="https://www.linkedin.com/in/advay/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </Link>
            <Link href="https://github.com/advayc" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </Link>
            <Link href="https://x.com/advay_c" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter />
            </Link>
          </nav>
          <Link className={styles.pdfLink} href="/resume.pdf" target="_blank" aria-label="Open resume PDF">
            <span>full résumé</span>
            <i aria-hidden="true" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
