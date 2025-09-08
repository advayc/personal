import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Link from '@/components/Link';

type ToggleOptionsType = 'dark' | 'light';

export default function Home() {
  const [selected, setSelected] = useState<ToggleOptionsType>('light');
  const [accentColor, setAccentColor] = useState<string>('#22D3EE');

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.9 } }
  };

  return (
    <motion.main 
      className="flex items-center justify-center min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">error 404 - you aren&apos;t supposed to be here</h1>
        <p className="text-lg mb-6">
          looks like you&apos;ve wandered off the path
          head back to the <Link href="/">landing</Link>
        </p>
      </div>
      <Footer selected={selected} setSelected={setSelected} accentColorProp={accentColor} setAccentColorProp={setAccentColor} />
    </motion.main>
  );
}