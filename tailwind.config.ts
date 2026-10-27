import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        electric: {
          DEFAULT: "#10B981", // Refined Emerald Green (replaces harsh neon #00FF88)
          dark: "#059669",    // Deep rich emerald for hover states
          light: "#34D399",   // Soft mint highlight
          muted: "#065F46",   // Subdued forest green for soft accents
          glow: "rgba(16, 185, 129, 0.12)",
        },
        brand: {
          black: "#0A0A0A",
          dark: "#121212",
          surface: "#1A1A1A",
          card: "#141414",
          border: "#262626",
          muted: "#888888",
        }
      },
      boxShadow: {
        electric: "0 2px 12px rgba(16, 185, 129, 0.15)",
        'electric-lg': "0 4px 18px rgba(16, 185, 129, 0.20)",
      },
    },
  },
  plugins: [],
};
export default config;
