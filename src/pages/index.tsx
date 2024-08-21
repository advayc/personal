import { useState } from "react";
import { Inter } from "next/font/google";
import Terminal from "@/components/Terminal";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <main className={`${inter.className} flex items-center justify-center min-h-screen bg-gray-100`}>
      <div className="relative">
        <h1 className="text-5xl font-bold text-center mb-8">advayc</h1>
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* File Icon */}
          <div 
            className="group w-20 h-20 cursor-pointer hover:bg-blue-500 hover:border-blue-700 transition-all border border-gray-300 p-2 bg-white"
            onClick={() => setIsTerminalOpen(true)}
          >
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 64 64"
            >
              <rect width="64" height="64" rx="4" ry="4" fill="#f0f0f0" />
              <path d="M16 16h32v32H16z" fill="#fff" stroke="#000" strokeWidth="1" />
              <path d="M20 24h24v2H20zM20 30h24v2H20zM20 36h24v2H20z" fill="#333" />
              <path d="M18 20h28v24H18z" fill="#fff" stroke="#000" strokeWidth="1" />
            </svg>
          </div>
          
          <div className="text-sm text-center group-hover:text-blue-500 transition-colors">
            OldTerminal.exe
          </div>
        </div>

        {isTerminalOpen && <Terminal onClose={() => setIsTerminalOpen(false)} />}
      </div>
    </main>
  );
}
