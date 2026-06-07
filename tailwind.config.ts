import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./actions/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
        display: [
          "var(--font-space-grotesk)",
          "var(--font-manrope)",
          "ui-sans-serif",
          "system-ui",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
