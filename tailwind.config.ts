import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  "#f0faf4",
          100: "#dcf2e4",
          200: "#bce5cc",
          300: "#8dd1ab",
          400: "#57b582",
          500: "#339962",
          600: "#1e7a3c",
          700: "#196333",
          800: "#174f2b",
          900: "#144124",
        },
        brand: {
          DEFAULT: "#1e7a3c",
          dark:    "#155c2c",
          light:   "#27a34f",
          pale:    "#eef7f1",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito-sans)"],
        display: ["var(--font-nunito)"],
      },
    },
  },
  plugins: [],
};

export default config;
