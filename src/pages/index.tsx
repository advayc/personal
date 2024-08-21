import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={`${inter.className} flex items-center justify-center min-h-screen`}>
      <h1 className="text-5xl font-bold text-center">advayc</h1>
    </main>
  );
}