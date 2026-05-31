/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          green: '#10b981',
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#3b82f6'
        }
      }
    },
  },
  plugins: [],
}
