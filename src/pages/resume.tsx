import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaFilePdf, FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import styles from "@/styles/Resume.module.css";

const current = [
  {
    title: "computer engineering at queen's university",
    detail: "incoming student · kingston, on",
    href: "https://www.queensu.ca/engineering/",
    imageSrc: "/experiences/queenseng.png",
  },
  {
    title: "seva eats",
    detail: "connecting gurdwara meals with families in need",
    href: "https://sevaeats.vercel.app/",
    imageSrc: "/projects/seva-eats.png",
  },
];

const previous = [
  {
    title: "software developer at neurotechuoft",
    detail: "building tools for neurotechnology research",
    href: "https://neurotechuoft.ca/",
    imageSrc: "/experiences/neurotechuoft.png",
  },
  {
    title: "glenforest computer science club",
    detail: "president · contests, workshops, and community",
    href: "https://github.com/glenforestss",
    imageSrc: "/experiences/gfsscsclub.png",
  },
  {
    title: "futuremd",
    detail: "vice president · web development and outreach",
    href: "https://futuremd.net/",
    imageSrc: "/experiences/futuremd.png",
  },
  {
    title: "vex robotics 31331b",
    detail: "team lead · ontario provincial championship",
    href: "https://github.com/advayc/31331B-VRC-High-Stakes",
    imageSrc: "/experiences/vex.png",
  },
];

const projects = [
  {
    title: "wrapped",
    detail: "spotify wrapped for messages",
    href: "https://github.com/advayc/wrapped",
  },
  {
    title: "gfss calendar",
    detail: "school events tracker · 1k+ mau",
    href: "https://clubs.advay.ca/",
  },
  {
    title: "sitemaker",
    detail: "resume-to-website generator",
    href: "https://sitemaker.advay.ca/",
  },
  {
    title: "nums",
    detail: "page-view counter api",
    href: "https://docs.advay.ca/",
  },
  {
    title: "spy",
    detail: "open-source party game, shipped to the app store",
    href: "https://spy.advay.ca/",
  },
  {
    title: "gq planets",
    detail: "nasa hackathon winner",
    href: "https://github.com/DeadUser123/Space-APPS-Hackathon",
  },
];

const accentColors = ["#ff3908", "#22D3EE", "#F472B6", "#A78BFA", "#34D399", "#F59E0B"];

type Item = {
  title: string;
  detail: string;
  href: string;
  imageSrc?: string;
};

function ResumeSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className={styles.section} aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.title}>
            <Link href={item.href} target="_blank" rel="noopener noreferrer">
              {item.imageSrc ? (
                <Image className={styles.itemIcon} src={item.imageSrc} alt="" width={24} height={24} />
              ) : (
                <span className={styles.itemIconPlaceholder} aria-hidden="true" />
              )}
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
  const [accentColor, setAccentColor] = useState("#ff3908");
  const [isAccentPickerOpen, setIsAccentPickerOpen] = useState(false);
  const accentPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAccent = window.localStorage.getItem("resumeAccentColor");
    if (storedAccent) setAccentColor(storedAccent);
  }, []);

  useEffect(() => {
    const closePicker = (event: MouseEvent) => {
      if (accentPickerRef.current && !accentPickerRef.current.contains(event.target as Node)) {
        setIsAccentPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, []);

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    window.localStorage.setItem("resumeAccentColor", color);
  };

  return (
    <main className={styles.page} style={{ "--accent": accentColor } as CSSProperties}>
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
              i build things
            </p>
          </div>
          <Link className={styles.avatar} href="/" aria-label="Back to home">
            <Image src="/favicon.png" alt="" width={72} height={72} priority />
            <span>home</span>
          </Link>
        </header>

        <ResumeSection title="currently" items={current} />
        <ResumeSection title="prev" items={previous} />
        <ResumeSection title="things i made" items={projects} />

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
          <div className={styles.footerActions}>
            <div className={styles.accentPicker} ref={accentPickerRef}>
              <button
                className={styles.accentButton}
                type="button"
                onClick={() => setIsAccentPickerOpen((open) => !open)}
                aria-expanded={isAccentPickerOpen}
                aria-label="Change accent color"
              >
                <i style={{ backgroundColor: accentColor }} aria-hidden="true" />
                <span>accent</span>
              </button>
              {isAccentPickerOpen && (
                <div className={styles.accentMenu} role="menu" aria-label="Accent colors">
                  <span>choose a color</span>
                  <div className={styles.swatches}>
                    {accentColors.map((color) => (
                      <button
                        key={color}
                        className={`${styles.swatch} ${accentColor === color ? styles.selectedSwatch : ""}`}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          updateAccentColor(color);
                          setIsAccentPickerOpen(false);
                        }}
                        style={{ backgroundColor: color }}
                        aria-label={`Use ${color} accent`}
                      />
                    ))}
                  </div>
                  <label className={styles.customColor}>
                    <span>custom hex</span>
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (/^#[0-9a-f]{0,6}$/i.test(value)) updateAccentColor(value);
                      }}
                      maxLength={7}
                      placeholder="#ff3908"
                      spellCheck={false}
                      aria-label="Custom accent hex color"
                    />
                  </label>
                </div>
              )}
            </div>
            <Link className={styles.pdfLink} href="/resume.pdf" target="_blank" aria-label="Open resume PDF">
              <span>full résumé</span>
              <FaFilePdf aria-hidden="true" />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
