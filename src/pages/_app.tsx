import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';
import Head from "next/head";

// SEO constants
const SITE_URL = 'https://advay.site'; // Replace with your actual domain
const DEFAULT_TITLE = 'Advay Chandorkar | Full Stack Developer';
const DEFAULT_DESCRIPTION = 'Full Stack Developer specializing in TypeScript, React, and Next.js. Building innovative web solutions with modern technologies.';
const DEFAULT_KEYWORDS = 'Advay Chandorkar, Full Stack Developer, Web Development, React, TypeScript, Next.js, Software Engineer';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`; // Add your OG image

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
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={DEFAULT_TITLE} />
        <meta property="og:description" content={DEFAULT_DESCRIPTION} />
        <meta property="og:image" content={DEFAULT_IMAGE} />
        <meta property="og:site_name" content="Advay Chandorkar Portfolio" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={SITE_URL} />
        <meta property="twitter:title" content={DEFAULT_TITLE} />
        <meta property="twitter:description" content={DEFAULT_DESCRIPTION} />
        <meta property="twitter:image" content={DEFAULT_IMAGE} />
        
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
    </>
  );
}