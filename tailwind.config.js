/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#d9ece3',
          200: '#b6d9c9',
          300: '#88bfa7',
          400: '#589e82',
          500: '#378064',
          600: '#27664f',
          700: '#1f5240',
          800: '#1a4234',
          900: '#14352a',
          950: '#0b1e18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
