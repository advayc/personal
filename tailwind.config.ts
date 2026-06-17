import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#828282",
        gprimary: "#29CA40",
      },
    },
  },
  plugins: [],
};

export default config;
