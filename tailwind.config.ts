import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F6F8F7",
          dim: "#EEF2F0",
        },
        ink: {
          DEFAULT: "#11201D",
          soft: "#4B5D59",
          faint: "#7C8C88",
        },
        primary: {
          dark: "#0A453E",
          DEFAULT: "#0E5F56",
          bright: "#17876F",
          soft: "#E4EFEC",
        },
        accent: {
          gold: "#C99A2E",
          soft: "#F7ECD4",
        },
        success: {
          DEFAULT: "#2F8F5B",
          soft: "#E3F2E9",
        },
        warning: {
          DEFAULT: "#C98A1F",
          soft: "#FBF0DC",
        },
        danger: {
          DEFAULT: "#B8462E",
          soft: "#F8E6E0",
        },
        border: {
          DEFAULT: "#DEE6E3",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      spacing: {
        13: "3.25rem",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17, 32, 29, 0.04), 0 8px 24px rgba(17, 32, 29, 0.06)",
        card: "0 1px 2px rgba(17, 32, 29, 0.05), 0 2px 8px rgba(17, 32, 29, 0.04)",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")({ strategy: "class" })],
};

export default config;
