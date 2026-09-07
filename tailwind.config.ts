import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "var(--color-primary-light)",
        },
        gold: "var(--color-gold)",
        line: "var(--color-line)",
        blush: "var(--color-blush)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      maxWidth: {
        wrap: "1280px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(43, 35, 32, 0.18)",
      },
      letterSpacing: {
        wideish: "0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
