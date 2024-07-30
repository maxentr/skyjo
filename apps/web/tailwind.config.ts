import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  safelist: [
    "grid-rows-1",
    "grid-rows-2",
    "grid-rows-3",
    "grid-rows-4",
    "grid-rows-5",
    "grid-rows-6",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        sdh: { raw: "(min-height: 480px)" },
        mdh: { raw: "(min-height: 690px)" },
        lgh: { raw: "(min-height: 800px)" },
      },
      colors: {
        card: {
          negative: "#5992E7",
          neutral: "#A0C4FF",
          low: "#7ACE7A",
          medium: "#F3E948",
          high: "#F56E6E",
        },
        body: "#F8F7EB",
        button: "#F6E9C9",
        container: "#fefdf7",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        scale: {
          "0%, 100%": {
            scale: "1",
          },
          "50%": {
            scale: "1.1",
          },
        },
        "small-scale": {
          "0%, 100%": {
            scale: "1",
          },
          "50%": {
            scale: "1.05",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scale: "scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "small-scale": "small-scale 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  variants: {
    height: ["responsive"],
  },
  ...(process.env.NEXT_PUBLIC_ENVIRONMENT === "PROD" ? { cssnano: {} } : {}),
} satisfies Config

export default config
