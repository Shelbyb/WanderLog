/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        sand: {
          50: '#fdf9f0',
          100: '#f7edda',
          200: '#edd9b0',
          300: '#e0c07e',
          400: '#d4a54e',
          500: '#c8912e',
          600: '#a97424',
          700: '#875a1e',
          800: '#6b471c',
          900: '#573b1a',
        },
        ocean: {
          50: '#eef7fb',
          100: '#d5edf5',
          200: '#b0dbec',
          300: '#7ac2de',
          400: '#3fa4cc',
          500: '#2488b2',
          600: '#1e6d96',
          700: '#1c587a',
          800: '#1c4a65',
          900: '#1b3e55',
        },
        slate: {
          850: '#1a2332',
          950: '#0d1520',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
};
