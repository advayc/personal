import { useState } from "react";
import { Inter } from "next/font/google";
import Terminal from "@/components/Terminal";
import File from "@/components/File";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <main className={`${inter.className} flex items-center justify-center min-h-screen`}>

    <div className="h-[50rem] w-full bg-black bg-grid-white/[0.05] relative flex items-center justify-center">
      <div className="relative z-10">
        <h1 className="text-5xl font-bold text-center text-white mb-8">hey i'm advay.</h1>
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <File
            setWindowOpen={setIsTerminalOpen}
            className="w-16 h-16"
          />
        </div>

        {isTerminalOpen && <Terminal onClose={() => setIsTerminalOpen(false)} />}
      </div>
    </div>
    </main>
  );
}
