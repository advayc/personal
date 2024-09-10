import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>advay chandorkar</title>
        <meta name="description" content="advay chandorkars portfolio site" />
      </Head>
      <TerminalProvider>
        <SelectionBoxProvider>
          <Component {...pageProps} />
        </SelectionBoxProvider>
      </TerminalProvider>
    </>
  );
}