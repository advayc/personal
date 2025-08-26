import "@/styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';
import Head from "next/head";

// Add this function at the top of the file, after the imports
function calculateAge(birthDate: Date): number {
  const today = new Date();
  // Convert to EST
  const estOffset = -5; // EST is UTC-5
  const utc = today.getTime() + (today.getTimezoneOffset() * 60000);
  const estDate = new Date(utc + (3600000 * estOffset));
  
  let age = estDate.getFullYear() - birthDate.getFullYear();
  const m = estDate.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && estDate.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// SEO constants
const BIRTH_DATE = new Date('2008-12-16T00:00:00-05:00'); // EST timezone
const AGE = calculateAge(BIRTH_DATE);
const SITE_URL = 'https://advayc.ca/';
const DEFAULT_TITLE = 'Advay Chandorkar | Full Stack Developer';
const DEFAULT_DESCRIPTION = `I'm a ${AGE}yo full stack developer, building things to solve problems`;
const DEFAULT_KEYWORDS = 'Advay Chandorkar, Full Stack Developer, Web Development, React, TypeScript, Next.js, Golang';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{DEFAULT_TITLE}</title>
        <meta name="title" content={DEFAULT_TITLE} />
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <meta name="keywords" content={DEFAULT_KEYWORDS} />
        <meta name="author" content="Advay Chandorkar" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="30z2hGJJbeDm2vE7ctaz5MxQE8TMgULkFW-wEZ5RsdM" />
        
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXX');
            `
          }}
        />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:site_name" content="Advay Chandorkar Portfolio" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:title" content={DEFAULT_TITLE} />
        <meta property="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta property="twitter:image" content="/meta.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* PWA */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        
        {/* Additional Meta */}
        <meta name="robots" content="index, follow" />
        <meta name="google" content="notranslate" />
        <link rel="canonical" href={SITE_URL} />
      </Head>
      <TerminalProvider>
        <SelectionBoxProvider>
          <Component {...pageProps} />
        </SelectionBoxProvider>
      </TerminalProvider>
      <SpeedInsights />
      <Analytics />
    </>
  );
}