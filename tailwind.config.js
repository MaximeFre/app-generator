/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--color-muted-foreground) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        destructive: "rgb(var(--color-destructive) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"],
      },
      fontSize: {
        display: ["56px", "60px"],
        "display-sm": ["40px", "44px"],
        h1: ["28px", "32px"],
        h2: ["22px", "28px"],
        h3: ["18px", "24px"],
        body: ["16px", "24px"],
        "body-sm": ["14px", "20px"],
        caption: ["12px", "16px"],
        mono: ["14px", "20px"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.05em",
        wider: "0.1em",
      },
    },
  },
  plugins: [],
};
