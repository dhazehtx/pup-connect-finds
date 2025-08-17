import type { Config } from "tailwindcss";
const plugin = require('tailwindcss/plugin');

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  safelist: ['data-[state=active]:text-white'],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // MP Theme System - Mobile/Desktop Unified
      colors: {
        // MP Theme Tokens
        mp: {
          bg: '#ffffff',          // --mp-bg: main background
          surface: '#ffffff',     // --mp-surface: surface color  
          baby: '#eef4ff',        // --mp-baby: soft baby-blue page background
          blue: '#2563eb',        // --mp-blue: primary blue
          'blue-600': '#1d4ed8',  // --mp-blue-600: darker blue
          accent: '#4f8bfd',      // --mp-accent: light blue tab text color
          text: '#0f172a',        // --mp-text: dark text
          muted: '#475569',       // --mp-muted: muted text
          border: '#e2e8f0',      // --mp-border: border color
        },
        // Centralized Surface & Text Colors
        surface: {
          DEFAULT: 'var(--color-surface)',      // #ffffff - main page background
          alt: 'var(--color-surface-alt)',      // #f5f7fb - light section background
          card: 'var(--color-surface-card)',    // #ffffff - cards and panels
        },
        text: {
          DEFAULT: 'var(--color-text)',         // #0f172a - primary text
          muted: 'var(--color-text-muted)',     // #64748b - secondary text
          inverse: 'var(--color-text-inverse)', // #ffffff - text on blue
        },
        
        // Centralized Brand Theme
        brand: {
          50: "#eff6ff",    // lightest blue
          100: "#dbeafe", 
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",   // primary brand blue
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",   // darkest blue
          DEFAULT: "#2563eb",
        },
        
        // Platform Primary (Blue) - Using CSS Variables
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',  // desktop blue
          600: 'var(--color-primary-600)', // Main brand blue
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-600)',
          foreground: 'var(--color-text-inverse)',
        },
        
        // Platform Secondary (Warm Orange)
        secondary: {
          50: "#fef7ed",
          100: "#fed7aa",
          200: "#feb575",
          300: "#fd923f",
          400: "#fb7c3c",
          500: "#f97316",
          600: "#ea580c", // Main accent orange
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          DEFAULT: "#ea580c",
          foreground: "#ffffff",
        },
        
        // Semantic Colors
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        warning: {
          50: "#fffbeb", 
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444", 
          600: "#dc2626",
          700: "#b91c1c",
        },
        
        // Enhanced Neutrals
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb", 
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        
        // shadcn/ui compatibility
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },

      // Typography Scale
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], 
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },

      // Spacing Scale (8pt grid)
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Border Radius Scale
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'DEFAULT': '0.5rem', 
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'card': '14px',       // consistent card radius
        'full': '9999px',
      },

      // Box Shadow Scale
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'DEFAULT': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -1px rgb(0 0 0 / 0.03)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
      },

      // Animation & Transitions
      transitionDuration: {
        '400': '400ms',
        '600': '600ms', 
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
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "50%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
      },

      // Grid & Layout
      gridTemplateColumns: {
        'responsive': 'repeat(auto-fit, minmax(280px, 1fr))',
        'listings': 'repeat(auto-fill, minmax(300px, 1fr))',
      },

      // Z-Index Scale
      zIndex: {
        'dropdown': '10',
        'modal': '40', 
        'toast': '50',
        'tooltip': '60',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    plugin(function ({ addVariant }) {
      addVariant('radix-active', '&[data-state="active"]');
    }),
    function ({ addComponents, theme }) {
      addComponents({
        /* primary (royal-blue) button — ALWAYS white text */
        '.btn-primary': {
          '@apply inline-flex items-center justify-center rounded-2xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition focus:outline-none': {},
        },
      });
    },
  ],
} satisfies Config;
