/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vercel-matched palette: pure black, white, zinc grays, functional accents.
        border: "#1f1f1f",
        input: "#1f1f1f",
        ring: "#0070f3",
        background: "#000000",
        foreground: "#ededed",
        muted: { DEFAULT: "#0a0a0a", foreground: "#a1a1a1" },
        card: { DEFAULT: "#0a0a0a", foreground: "#ededed" },
        primary: { DEFAULT: "#ffffff", foreground: "#000000" },
        secondary: { DEFAULT: "#111111", foreground: "#ededed" },
        accent: { DEFAULT: "#0070f3", foreground: "#ffffff" }, // Vercel blue
        success: "#2ed3a0",
        warning: "#f5a623",
        danger: "#ff4d4d",
        vercel: {
          blue: "#0070f3",
          cyan: "#50e3c2",
          purple: "#7928ca",
          pink: "#ff0080",
          amber: "#f5a623",
          green: "#2ed3a0",
        },
      },
      borderRadius: { lg: "0.625rem", md: "0.45rem", sm: "0.3rem" },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
}
