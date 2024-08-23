import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TerminalProvider>
      <SelectionBoxProvider>
        <Component {...pageProps} />
      </SelectionBoxProvider>
    </TerminalProvider>
  );
}