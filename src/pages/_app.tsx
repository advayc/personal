import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { TerminalProvider } from '@/components/TerminalContext';
import { SelectionBoxProvider } from '@/components/SelectionContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TerminalProvider>
      <SelectionBoxProvider>
        <Component {...pageProps} />
      </SelectionBoxProvider>
    </TerminalProvider>
  );
}