/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        rose: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fbcfe0',
          300: '#f9a8c4',
          400: '#f472a6',
          500: '#e6336b',
          600: '#c81e5a',
          700: '#a21946',
          800: '#7d1638',
          900: '#5c1029',
        },
        cream: {
          50: '#fffaf3',
          100: '#fdf3e4',
          200: '#f8e4c5',
        },
        ink: {
          900: '#1a0b14',
          800: '#241221',
          700: '#33182d',
        },
        gold: {
          400: '#d4a45c',
          500: '#b8893f',
        },
      },
      backgroundImage: {
        'romance-gradient':
          'radial-gradient(ellipse at top, rgba(230,51,107,0.18), transparent 60%), radial-gradient(ellipse at bottom, rgba(212,164,92,0.12), transparent 55%), linear-gradient(180deg, #1a0b14 0%, #241221 50%, #1a0b14 100%)',
        'soft-rose':
          'linear-gradient(135deg, #fff5f7 0%, #ffe4ec 50%, #fbcfe0 100%)',
      },
      boxShadow: {
        glow: '0 0 60px -10px rgba(230, 51, 107, 0.55)',
        soft: '0 30px 60px -25px rgba(0, 0, 0, 0.55)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
