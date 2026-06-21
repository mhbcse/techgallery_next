import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent — Tech Gallery electric blue (#007bff)
        primary: '#000000',
        secondary: '#007bff',
        'secondary-container': '#007bff',
        'secondary-fixed': '#d8e2ff',
        'secondary-fixed-dim': '#adc6ff',
        // Surfaces / neutrals
        background: '#f7f9fb',
        surface: '#f7f9fb',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#45464d',
        outline: '#76777d',
        'outline-variant': '#c6c6cd',
        // Dark containers
        'primary-container': '#131b2e',
        'tertiary-container': '#0b1c30',
        'on-primary-container': '#7c839b',
        'on-primary-fixed': '#131b2e',
        'on-primary': '#ffffff',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Hanken Grotesk', 'sans-serif'],
        'display-lg': ['var(--font-display)', 'Hanken Grotesk', 'sans-serif'],
        'headline-lg': ['var(--font-display)', 'Hanken Grotesk', 'sans-serif'],
        'headline-lg-mobile': ['var(--font-display)', 'Hanken Grotesk', 'sans-serif'],
        'body-md': ['var(--font-body)', 'Inter', 'sans-serif'],
        'body-sm': ['var(--font-body)', 'Inter', 'sans-serif'],
        'label-md': ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        'label-sm': ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-sm': ['10px', { lineHeight: '14px', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        'gutter-md': '16px',
        'margin-lg': '32px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config
