import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ============================================================
      // COLOR SYSTEM: Pahami Dia Design Language
      // Warm cream + Deep teal + Warm gold
      // ============================================================
      colors: {
        // Warm cream backgrounds
        cream: {
          50:  '#FDFBF7',
          100: '#FAF7F2',   // main app background
          200: '#F5EFE2',
          300: '#EDE4CE',
          400: '#E0D3B4',
          500: '#CCBB93',
        },

        // Deep teal: primary brand color
        teal: {
          50:  '#EDF5F5',
          100: '#D6ECEC',
          200: '#AEDADA',
          300: '#7DC5C5',
          400: '#4DAFAF',
          500: '#2A9696',
          600: '#0D7C7C',
          700: '#0D6E6E',   // primary
          800: '#0A5252',
          900: '#083838',
          950: '#052424',
        },

        // Warm gold: accent color
        gold: {
          50:  '#FEF9EC',
          100: '#FDF0C8',
          200: '#F9DC85',
          300: '#F3C43D',
          400: '#DAAA1A',
          500: '#C9951A',   // accent
          600: '#A87B10',
          700: '#89630C',
          800: '#6A4C0A',
          900: '#4E3808',
        },

        // Deep ink: text colors
        ink: {
          50:  '#F0F5F5',
          100: '#D6E5E5',
          200: '#ADCBCB',
          300: '#7AACAC',
          400: '#4A8080',
          500: '#2D6060',
          600: '#1A4040',
          700: '#1A2B2B',   // primary text
          800: '#0F1A1A',
          900: '#080E0E',
        },

        // Semantic colors
        success: {
          50:  '#EDFAF3',
          500: '#2D7A5B',
          700: '#1A4F3A',
        },
        warning: {
          50:  '#FEF9EC',
          500: '#C9951A',
          700: '#89630C',
        },
        error: {
          50:  '#FEF2F2',
          500: '#C0392B',
          700: '#8B1A1A',
        },
      },

      // ============================================================
      // TYPOGRAPHY: Plus Jakarta Sans
      // ============================================================
      fontFamily: {
        sans:    ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:    ['0.875rem', { lineHeight: '1.375rem' }],
        base:  ['1rem',     { lineHeight: '1.625rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl': ['3rem',     { lineHeight: '3.5rem' }],
      },

      fontWeight: {
        light:    '300',
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
        extrabold: '800',
      },

      // ============================================================
      // SPACING: generous, spacious feel
      // ============================================================
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
      },

      // ============================================================
      // BORDER RADIUS: soft, rounded, friendly
      // ============================================================
      borderRadius: {
        '2xs': '4px',
        xs:    '6px',
        sm:    '8px',
        DEFAULT: '10px',
        md:    '12px',
        lg:    '16px',
        xl:    '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
      },

      // ============================================================
      // SHADOWS: warm and soft
      // ============================================================
      boxShadow: {
        'xs':    '0 1px 2px 0 rgba(10, 52, 52, 0.04)',
        'sm':    '0 2px 4px 0 rgba(10, 52, 52, 0.06)',
        DEFAULT: '0 4px 8px 0 rgba(10, 52, 52, 0.08)',
        'md':    '0 6px 16px 0 rgba(10, 52, 52, 0.10)',
        'lg':    '0 12px 24px 0 rgba(10, 52, 52, 0.12)',
        'xl':    '0 20px 40px 0 rgba(10, 52, 52, 0.14)',
        'inner': 'inset 0 2px 4px 0 rgba(10, 52, 52, 0.06)',
        'glow-teal': '0 0 20px rgba(13, 110, 110, 0.20)',
        'glow-gold': '0 0 20px rgba(201, 149, 26, 0.20)',
        'card':  '0 2px 8px 0 rgba(10, 52, 52, 0.06), 0 1px 2px 0 rgba(10, 52, 52, 0.04)',
        'card-hover': '0 8px 24px 0 rgba(10, 52, 52, 0.12), 0 2px 6px 0 rgba(10, 52, 52, 0.06)',
      },

      // ============================================================
      // TRANSITIONS: smooth, calm
      // ============================================================
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
      },

      transitionTimingFunction: {
        'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ============================================================
      // ANIMATION
      // ============================================================
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.3s ease-out',
        'fade-up':    'fade-up 0.4s ease-out',
        'slide-up':   'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },

      // ============================================================
      // SCREEN BREAKPOINTS: mobile-first
      // ============================================================
      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },

      // ============================================================
      // SAFE AREA (for mobile notch/bottom bar)
      // ============================================================
      padding: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top':    'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}

export default config
