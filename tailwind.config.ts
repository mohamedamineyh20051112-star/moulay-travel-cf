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
        primary: {
          DEFAULT: "#000000", // Black
          light: "#333333",
        },
        gold: {
          DEFAULT: "#D4AF37", // Metallic Gold
          light: "#F3E5AB",
          dark: "#AA8C2C",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-cairo)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
