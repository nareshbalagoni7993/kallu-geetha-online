/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#2d7a2d', light: '#3a9a3a', dark: '#1e5c1e' },
        secondary: { DEFAULT: '#f5a623', light: '#f7bc5a', dark: '#c4841a' },
        toddy:     { DEFAULT: '#8B4513', light: '#a0522d', dark: '#6b3410' },
      },
    },
  },
  plugins: [],
};

