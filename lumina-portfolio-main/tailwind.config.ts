import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', "Georgia", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "Inter Fallback",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        raised: "hsl(var(--raised) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        faint: "hsl(var(--faint) / <alpha-value>)",
        line: "hsl(var(--line) / <alpha-value>)",
        gold: {
          100: "hsl(var(--gold-100) / <alpha-value>)",
          300: "hsl(var(--gold-300) / <alpha-value>)",
          500: "hsl(var(--gold-500) / <alpha-value>)",
          700: "hsl(var(--gold-700) / <alpha-value>)",
          900: "hsl(var(--gold-900) / <alpha-value>)",
        },
      },
      fontSize: {
        /* Instrument Serif is already narrow, so it gets air rather than
           negative tracking — tight letterspacing on a condensed face is what
           made this read as squashed. */
        display: ["clamp(3rem, 7.5vw, 5rem)", { lineHeight: "1.12", letterSpacing: "0.005em" }],
      },
      maxWidth: {
        /* 872px = 11 grid cells of content plus 2x40px padding, which puts
           both content edges on a vertical grid line. */
        page: "54.5rem",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
