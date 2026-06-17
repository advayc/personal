import "@/styles/globals.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';
import Head from "next/head";
import { calculateAge } from '@/utils/age';

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false }
);
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false }
);

const BIRTH_DATE = new Date(2008, 11, 16);
const AGE = calculateAge(BIRTH_DATE);
const SITE_URL = 'https://advayc.ca/';
const DEFAULT_TITLE = 'Advay Chandorkar | Full Stack Developer';
const DEFAULT_DESCRIPTION = `I'm a ${AGE}yo full stack developer, building things to solve problems`;
const DEFAULT_KEYWORDS = 'Advay Chandorkar, Full Stack Developer, Web Development, React, TypeScript, Next.js, Golang';

function DeferredMonitoring() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const enable = () => setReady(true);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(enable, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(enable, 2000);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>{DEFAULT_TITLE}</title>
        <meta name="title" content={DEFAULT_TITLE} />
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_KEYWORDS} />
        <meta name="author" content="Advay Chandorkar" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-site-verification" content="30z2hGJJbeDm2vE7ctaz5MxQE8TMgULkFW-wEZ5RsdM" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:site_name" content="Advay Chandorkar Portfolio" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:title" content={DEFAULT_TITLE} />
        <meta property="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta property="twitter:image" content="/meta.png" />
        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
      </Head>

      <TerminalProvider>
        <SelectionBoxProvider>
          <Component {...pageProps} />
        </SelectionBoxProvider>
      </TerminalProvider>
      <DeferredMonitoring />
    </>
  );
}
