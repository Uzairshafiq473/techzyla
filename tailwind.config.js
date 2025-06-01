/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6FBFF',
          100: '#CCF7FF',
          200: '#99EFFF',
          300: '#66E7FF',
          400: '#33DFFF',
          500: '#00D7FF', // Primary neon blue
          600: '#00ACE6',
          700: '#0081CC',
          800: '#0057B3',
          900: '#002C99',
        },
        secondary: {
          50: '#F3E8FF',
          100: '#E9D5FF',
          200: '#D8B4FE',
          300: '#C084FC',
          400: '#A855F7',
          500: '#8B5CF6', // Secondary purple
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        accent: {
          50: '#EAFFF5',
          100: '#D5FFEB',
          200: '#ABFFD6',
          300: '#81FFC2',
          400: '#57FFAD',
          500: '#00F59B', // Accent neon green
          600: '#00CC82',
          700: '#00A36A',
          800: '#007A4F',
          900: '#005233',
        },
        dark: {
          100: '#222222',
          200: '#1A1A1A',
          300: '#121212',
          400: '#0A0A0A',
          500: '#050505', // Main background
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};