/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['LXGW WenKai GB', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['LXGW WenKai GB', 'system-ui', '-apple-system', 'serif'],
        'romantic': ['LXGW WenKai GB', 'system-ui', '-apple-system', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            fontFamily: 'LXGW WenKai GB, system-ui, -apple-system, sans-serif',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 