/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        mono: ["Fira Mono", "monospace"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          "08": "hsla(var(--primary-08))",
          16: "hsla(var(--primary-16))",
          24: "hsla(var(--primary-24))",
          32: "hsla(var(--primary-32))",
          40: "hsla(var(--primary-40))",
          48: "hsla(var(--primary-48))",
          56: "hsla(var(--primary-56))",
          64: "hsla(var(--primary-64))",
          72: "hsla(var(--primary-72))",
          80: "hsla(var(--primary-80))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          "08": "hsla(var(--secondary-08))",
          16: "hsla(var(--secondary-16))",
          24: "hsla(var(--secondary-24))",
          32: "hsla(var(--secondary-32))",
          40: "hsla(var(--secondary-40))",
          48: "hsla(var(--secondary-48))",
          56: "hsla(var(--secondary-56))",
          64: "hsla(var(--secondary-64))",
          72: "hsla(var(--secondary-72))",
          80: "hsla(var(--secondary-80))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          "08": "hsla(var(--tertiary-08))",
          16: "hsla(var(--tertiary-16))",
          24: "hsla(var(--tertiary-24))",
          32: "hsla(var(--tertiary-32))",
          40: "hsla(var(--tertiary-40))",
          48: "hsla(var(--tertiary-48))",
          56: "hsla(var(--tertiary-56))",
          64: "hsla(var(--tertiary-64))",
          72: "hsla(var(--tertiary-72))",
          80: "hsla(var(--tertiary-80))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          "08": "hsla(var(--muted-08))",
          16: "hsla(var(--muted-16))",
          24: "hsla(var(--muted-24))",
          32: "hsla(var(--muted-32))",
          40: "hsla(var(--muted-40))",
          48: "hsla(var(--muted-48))",
          56: "hsla(var(--muted-56))",
          64: "hsla(var(--muted-64))",
          72: "hsla(var(--muted-72))",
          80: "hsla(var(--muted-80))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          "08": "hsla(var(--accent-08))",
          16: "hsla(var(--accent-16))",
          24: "hsla(var(--accent-24))",
          32: "hsla(var(--accent-32))",
          40: "hsla(var(--accent-40))",
          48: "hsla(var(--accent-48))",
          56: "hsla(var(--accent-56))",
          64: "hsla(var(--accent-64))",
          72: "hsla(var(--accent-72))",
          80: "hsla(var(--accent-80))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "flash-success": {
          "50%": {
            backgroundColor: "hsl(var(--primary) / 0.5)",
          },
        },
        "flash-wireless": {
          "50%": {
            backgroundColor: "hsl(var(--tertiary) / 0.5)",
          },
        },
        "flash-error": {
          "50%": {
            backgroundColor: "hsl(var(--secondary) / 0.5)",
          },
        },
        "flash-unknown": {
          "50%": {
            backgroundColor: "hsl(var(--accent) / 0.5)",
          },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blink: {
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "flash-success-infinite":
          "flash-success ease-in-out 4s alternate infinite",
        "flash-success": "flash-success ease-in-out 2s 4 alternate",
        "flash-wireless": "flash-wireless ease-in-out 2s 4 alternate",
        "flash-error": "flash-error ease-in-out 2s 4 alternate",
        "flash-unknown": "flash-unknown ease-in-out 2s 4 alternate",
        "fade-in": "fade-in 0.6s ease-out",
        blink: "blink 2s step-start infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
