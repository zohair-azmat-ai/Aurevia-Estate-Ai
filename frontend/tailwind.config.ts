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
        // ── Aurevia Design System ─────────────────────────────
        brand: {
          gold: "#C9A84C",
          "gold-muted": "#A8893A",
          "gold-glow": "rgba(201, 168, 76, 0.13)",
          "gold-subtle": "rgba(201, 168, 76, 0.07)",
        },
        surface: {
          base: "#0A0A0F",
          elevated: "#111118",
          accent: "#16161F",
          border: "#1E1E2E",
          "border-subtle": "#16161E",
        },
        content: {
          primary: "#F0EDE8",
          secondary: "#9896A4",
          muted: "#52515C",
          inverse: "#0A0A0F",
        },
        status: {
          green: "#22C55E",
          "green-subtle": "rgba(34, 197, 94, 0.12)",
          amber: "#F59E0B",
          "amber-subtle": "rgba(245, 158, 11, 0.12)",
          red: "#EF4444",
          "red-subtle": "rgba(239, 68, 68, 0.12)",
          blue: "#3B82F6",
          "blue-subtle": "rgba(59, 130, 246, 0.12)",
          purple: "#7C3AED",
          "purple-subtle": "rgba(124, 58, 237, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      letterSpacing: {
        widest: "0.15em",
        "extra-wide": "0.25em",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        gold: "0 0 40px rgba(201, 168, 76, 0.15)",
        "gold-sm": "0 0 20px rgba(201, 168, 76, 0.10)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
        "inner-border": "inset 0 0 0 1px rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-gold": "linear-gradient(135deg, #C9A84C 0%, #A8893A 100%)",
        "gradient-dark": "linear-gradient(180deg, #111118 0%, #0A0A0F 100%)",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 168, 76, 0.12) 0%, transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(201, 168, 76, 0.25)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
