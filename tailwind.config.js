/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // One accent drawn from the sea, one warm neutral, one cool ground.
        sea: { DEFAULT: '#2E6E69', deep: '#21514D', tint: '#E4EFED' },
        ink: { DEFAULT: '#1C2B30', 2: '#4E5F64', 3: '#7B8B8F' },
        sand: { DEFAULT: '#F1ECE3', deep: '#E3DACB' },
        foam: '#F6F8F7',
        line: '#D8DEDC',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(28, 43, 48, 0.06), 0 8px 24px -12px rgba(28, 43, 48, 0.18)',
      },
      maxWidth: {
        read: '46rem',
        work: '56rem',
      },
    },
  },
  plugins: [],
};
