import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { FaArrowUpRightFromSquare, FaFilePdf, FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const current = [
  {
    title: "computer engineering at queen's university",
    detail: "incoming student · kingston, on",
    href: "https://www.queensu.ca/engineering/",
    imageSrc: "/experiences/queenseng.png",
  },
  {
    title: "building seva eats",
    detail: "connecting gurdwara meals with families in need",
    href: "https://sevaeats.vercel.app/",
    imageSrc: "/experiences/seva.png",
  },
];

const previous = [
  {
    title: "neurotechuoft",
    detail: "developer · built tools for neurotechnology research",
    href: "https://neurotechuoft.ca/",
    imageSrc: "/experiences/neurotechuoft.png",
  },
  {
    title: "glenforest computer science club",
    detail: "president · organized coding contests, workshops and events",
    href: "https://github.com/glenforestss",
    imageSrc: "/experiences/gfsscsclub.png",
  },
  {
    title: "vex robotics 31331",
    detail: "team lead · built and coded autonomus robots",
    href: "https://github.com/advayc/31331B-VRC-High-Stakes",
    imageSrc: "/experiences/vex.png",
  },
  {
    title: "futuremd",
    detail: "vice president · coded websites and led outreach",
    href: "https://futuremd.net/",
    imageSrc: "/experiences/futuremd.png",
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
    detail: "won a nasa hackathon",
    href: "https://github.com/DeadUser123/Space-APPS-Hackathon",
  },
];

const accentColors = ["#F59E0B", "#ff3908", "#22D3EE", "#F472B6", "#A78BFA", "#34D399"];

type Item = {
  title: string;
  detail: string;
  href: string;
  imageSrc?: string;
};

function ResumeSection({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-[22px] max-[700px]:mt-[20px]" aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className="mb-[10px] text-[27px] font-medium leading-[normal] tracking-[-0.025em] max-[700px]:text-[24px]">{title}</h2>
      <ul className="m-0 ml-[14px] list-none p-0 max-[700px]:ml-[10px]">
        {items.map((item) => (
          <li className="[&+li]:mt-[3px]" key={item.title}>
            <Link className={`group mx-[-14px] grid min-h-[44px] grid-cols-[34px_minmax(240px,1fr)_minmax(220px,0.9fr)_16px] items-center gap-[10px] rounded-[11px] px-[14px] py-2 text-[var(--muted)] no-underline transition-[color,background-color,padding] duration-[150ms] ease-[ease] hover:pl-[17px] hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] focus-visible:pl-[17px] focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none max-[700px]:mx-[-10px] max-[700px]:min-h-0 max-[700px]:px-[10px] max-[700px]:py-[9px] max-[700px]:hover:pl-[13px] max-[700px]:focus-visible:pl-[13px] ${item.imageSrc ? "max-[700px]:grid-cols-[88px_minmax(0,1fr)_16px] max-[700px]:items-center max-[700px]:gap-x-3 max-[700px]:gap-y-1" : "max-[700px]:flex max-[700px]:flex-wrap max-[700px]:gap-x-2 max-[700px]:gap-y-[3px]"}`} href={item.href} target="_blank" rel="noopener noreferrer">
              {item.imageSrc ? (
                <Image className="grid size-8 place-items-center text-[22px] leading-none text-[var(--muted)] transition-[color] duration-[150ms] ease-[ease] group-hover:text-[var(--accent)] group-focus-visible:text-[var(--accent)] max-[700px]:row-span-2 max-[700px]:size-[84px]" src={item.imageSrc} alt="" width={84} height={84} />
              ) : (
                <span className="grid size-8 place-items-center text-[22px] leading-none text-[var(--muted)] transition-[color] duration-[150ms] ease-[ease] group-hover:text-[var(--accent)] group-focus-visible:text-[var(--accent)] max-[700px]:mr-0.5 max-[700px]:basis-6" aria-hidden="true" />
              )}
              <span className={`text-[clamp(17px,1.6vw,20px)] font-[550] leading-[1.25] tracking-[-0.025em] max-[700px]:text-[17px] ${item.imageSrc ? "max-[700px]:col-start-2 max-[700px]:row-start-1 max-[700px]:w-auto" : "max-[700px]:w-[calc(100%_-_24px)]"}`}>{item.title}</span>
              <span className={`text-right text-[15px] leading-[1.35] opacity-[0.72] transition-[opacity] duration-[150ms] ease-[ease] group-hover:opacity-100 group-focus-visible:opacity-100 max-[700px]:text-[14px] ${item.imageSrc ? "max-[700px]:col-start-2 max-[700px]:row-start-2 max-[700px]:w-auto max-[700px]:text-left" : "max-[700px]:w-full max-[700px]:text-left"}`}>{item.detail}</span>
              <FaArrowUpRightFromSquare className={`size-3 -translate-x-1 translate-y-1 opacity-0 transition-[opacity,transform] duration-[150ms] ease-[ease] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 max-[700px]:ml-auto ${item.imageSrc ? "max-[700px]:col-start-3 max-[700px]:row-span-2 max-[700px]:row-start-1" : ""}`} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Resume() {
  const [accentColor, setAccentColor] = useState("#F59E0B");
  const [isAccentPickerOpen, setIsAccentPickerOpen] = useState(false);
  const accentPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAccent = window.localStorage.getItem("siteAccentColor") ?? window.localStorage.getItem("resumeAccentColor");
    if (storedAccent) setAccentColor(storedAccent);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent-color", accentColor);
    const rgb = accentColor.replace("#", "");
    if (rgb.length === 6) {
      const r = parseInt(rgb.slice(0, 2), 16);
      const g = parseInt(rgb.slice(2, 4), 16);
      const b = parseInt(rgb.slice(4, 6), 16);
      root.style.setProperty("--accent-color-rgb", `${r}, ${g}, ${b}`);
    }

    try {
      window.localStorage.setItem("siteAccentColor", accentColor);
      window.localStorage.removeItem("resumeAccentColor");
    } catch {}
  }, [accentColor]);

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
  };

  return (
    <main className="min-h-screen [--accent:#ff3908] [--paper:#171717] [--ink:#f1efed] [--muted:#aaa5a2] bg-[var(--paper)] font-[Helvetica Neue,Helvetica,ui-sans-serif,sans-serif] text-[var(--ink)] motion-reduce:[&_*]:[scroll-behavior:auto!important] motion-reduce:[&_*]:[transition-duration:0.01ms!important]" style={{ "--accent": accentColor } as CSSProperties}>
      <Head>
        <title>about advay chandorkar</title>
        <meta
          name="description"
          content="A short summary of Advay Chandorkar: developer, computer engineering student, and builder from Toronto."
        />
        <meta name="theme-color" content="#171717" />
      </Head>

      <div className="mx-auto w-[min(calc(100%_-_48px),1080px)] py-[56px] pb-[40px] max-[700px]:w-[min(calc(100%_-_36px),1080px)] max-[700px]:py-8 max-[700px]:pb-7">
         <header className="mb-[22px] grid grid-cols-[1fr_auto] items-start justify-between gap-9 max-[700px]:mb-4 max-[700px]:grid-cols-[minmax(0,1fr)_52px] max-[700px]:gap-[14px]">
           <div>
             <p className="mb-0 mt-0 text-[18px] tracking-[-0.02em] text-[var(--muted)]">hello, i&apos;m</p>
             <h1 className="m-0 text-[clamp(56px,7.2vw,88px)] font-normal leading-[0.98] tracking-[-0.065em]">advay.</h1>
             <p className="col-span-full mb-0 mt-[10px] max-w-[680px] text-[clamp(18px,1.8vw,23px)] font-medium leading-[1.38] tracking-[-0.025em] text-[var(--muted)] max-[700px]:col-span-full">
               i build things
             </p>
           </div>
           <Link className="group relative block size-[100px] overflow-hidden bg-[#efece8] outline-0 outline-[color-mix(in_srgb,var(--accent)_22%,transparent)] transition-[outline-width,transform] duration-[180ms] ease-[ease] hover:rotate-[2deg] hover:outline-[7px] focus-visible:rotate-[2deg] focus-visible:outline-[7px] max-[700px]:mt-[7px] max-[700px]:size-[72px]" href="/" aria-label="Back to home">
            <Image className="absolute inset-0 size-full object-cover [image-rendering:pixelated] transition-[opacity,transform] duration-[500ms] ease-[ease] opacity-0 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100" src="/icons/me-asci.png" alt="" width={100} height={100} priority />
            <Image className="absolute inset-0 size-full scale-100 object-cover [image-rendering:auto] opacity-100 transition-[opacity,transform] duration-[500ms] ease-[ease] group-hover:scale-[0.96] group-hover:opacity-0 group-focus-visible:scale-[0.96] group-focus-visible:opacity-0" src="/icons/me.png" alt="" width={100} height={100} priority />
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--accent)] p-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--paper)] transition-transform duration-[180ms] ease-[ease] group-hover:translate-y-0 group-focus-visible:translate-y-0">home</span>
          </Link>
        </header>

        <ResumeSection title="currently" items={current} />
        <ResumeSection title="prev" items={previous} />
        <ResumeSection title="things i made" items={projects} />

        <footer className="mt-[42px] flex items-end justify-between gap-6 max-[700px]:mt-9 max-[700px]:items-center">
          <nav className="flex gap-2" aria-label="Social links">
            <Link className="grid size-[42px] place-items-center rounded-[9px] text-[23px] text-[var(--muted)] transition-[color,background-color,transform] duration-[150ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:-translate-y-0.5 focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none" href="mailto:advay.chandorkar@gmail.com" aria-label="Email Advay">
              <MdEmail />
            </Link>
            <Link className="grid size-[42px] place-items-center rounded-[9px] text-[23px] text-[var(--muted)] transition-[color,background-color,transform] duration-[150ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:-translate-y-0.5 focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none" href="https://www.linkedin.com/in/advay/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </Link>
            <Link className="grid size-[42px] place-items-center rounded-[9px] text-[23px] text-[var(--muted)] transition-[color,background-color,transform] duration-[150ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:-translate-y-0.5 focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none" href="https://github.com/advayc" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </Link>
            <Link className="grid size-[42px] place-items-center rounded-[9px] text-[23px] text-[var(--muted)] transition-[color,background-color,transform] duration-[150ms] ease-[ease] hover:-translate-y-0.5 hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:-translate-y-0.5 focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none" href="https://x.com/advay_c" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter />
            </Link>
          </nav>
          <div className="flex items-center gap-4 max-[700px]:gap-[6px]">
            <div className="relative" ref={accentPickerRef}>
              <button
                className="flex cursor-pointer items-center gap-[9px] rounded-lg border-0 bg-transparent px-[10px] py-[7px] font-inherit text-[12px] uppercase tracking-[0.08em] text-[var(--muted)] transition-[color,background-color] duration-[150ms] ease-[ease] hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none max-[700px]:[&>span]:hidden"
                type="button"
                onClick={() => setIsAccentPickerOpen((open) => !open)}
                aria-expanded={isAccentPickerOpen}
                aria-label="Change accent color"
              >
                <i className="block size-[15px] rounded-full" style={{ backgroundColor: accentColor }} aria-hidden="true" />
                <span>accent</span>
              </button>
              {isAccentPickerOpen && (
                <div className="absolute bottom-[calc(100%+10px)] right-0 z-[2] w-[168px] rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#222] p-[13px] shadow-[0_16px_36px_rgba(0,0,0,0.35)] max-[700px]:right-[-8px]" role="menu" aria-label="Accent colors">
                  <span className="mb-[11px] block text-[11px] uppercase tracking-[0.07em] text-[var(--muted)]">choose a color</span>
                  <div className="flex flex-wrap gap-[9px]">
                    {accentColors.map((color) => (
                      <button
                        key={color}
                        className={`size-6 cursor-pointer rounded-full border-2 border-transparent p-0 transition-[transform,border-color] duration-[140ms] ease-[ease] hover:scale-[1.13] hover:outline-none focus-visible:scale-[1.13] focus-visible:outline-none ${accentColor === color ? "border-[var(--ink)] shadow-[0_0_0_2px_#222]" : ""}`}
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
                  <label className="mt-[13px] block border-t border-t-[rgba(255,255,255,0.1)] pt-[11px]">
                    <span className="mb-[7px] flex items-center gap-[7px] text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]">
                      <i className="size-[9px] rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.08)]" style={{ backgroundColor: accentColor }} aria-hidden="true" />
                      custom color
                    </span>
                    <span className="flex h-[29px] items-center rounded-[5px] border border-[rgba(255,255,255,0.14)] bg-[#171717] px-2 text-[12px] text-[var(--muted)] transition-[border-color,box-shadow] duration-[150ms] ease-[ease] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_18%,transparent)]">
                      <span>#</span>
                      <input
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 pl-0.5 font-inherit text-[12px] text-[var(--ink)] focus:outline-none"
                        type="text"
                        value={accentColor.replace(/^#/, "")}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (/^[0-9a-f]{0,6}$/i.test(value)) updateAccentColor(`#${value}`);
                        }}
                        maxLength={6}
                        placeholder="ff3908"
                        spellCheck={false}
                        aria-label="Custom accent hex color"
                      />
                    </span>
                  </label>
                </div>
              )}
            </div>
            <Link className="flex items-center gap-[17px] p-[7px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] no-underline transition-[color,background-color] duration-[150ms] ease-[ease] hover:rounded-[5px] hover:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] hover:text-[var(--accent)] hover:outline-none focus-visible:rounded-[5px] focus-visible:bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] focus-visible:text-[var(--accent)] focus-visible:outline-none max-[700px]:[&>span]:hidden" href="/resume.pdf"  target="_blank" aria-label="Open resume PDF">
              <span>full résumé</span>
              <FaFilePdf aria-hidden="true"/>
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
