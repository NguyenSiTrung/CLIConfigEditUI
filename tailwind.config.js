export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic color tokens using CSS variables
        surface: {
          primary: 'rgb(var(--color-surface-primary) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          overlay: 'rgb(var(--color-surface-overlay) / <alpha-value>)',
        },
        border: {
          subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-border-default) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        content: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },
        accent: {
          primary: 'rgb(var(--color-accent-primary) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
        },
        // Dark theme colors
        header: {
          DEFAULT: '#0d0d0d',
          light: '#ffffff',
        },
        sidebar: {
          DEFAULT: '#141414',
          hover: '#1f1f1f',
          light: '#f8fafc',
          'light-hover': '#f1f5f9',
        },
        editor: {
          DEFAULT: '#1a1a1a',
          line: '#252525',
          light: '#ffffff',
          'light-line': '#f8fafc',
        },
        gray: {
          750: '#2a2a2a',
          850: '#171717',
        },
        // Light theme accent colors
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          elevated: '#ffffff',
          border: '#e2e8f0',
          'border-subtle': '#f1f5f9',
          text: '#0f172a',
          'text-secondary': '#475569',
          'text-muted': '#94a3b8',
        },
      },
      animation: {
        'in': 'in 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
      },
      keyframes: {
        'in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'light-sm': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'light-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'light-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
