import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        "soft-panel": "0 18px 50px rgb(16 24 40 / 0.10)",
        "soft-ring": "0 0 0 1px rgb(15 118 110 / 0.16)"
      },
      colors: {
        canvas: "#f6f8f5",
        ink: "#14201d",
        mist: "#e7ede8",
        pine: "#0f766e",
        poppy: "#b42318",
        saffron: "#d97706",
        tidal: "#2563eb"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};

export default config;
