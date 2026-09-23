/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          dark: '#071A2B',    // Dark navy background
          panel: '#0B2A3F',   // Deep ocean blue panels
          accent: '#00C2D1',  // Teal/cyan accents
        }
      }
    },
  },
  plugins: [],
}
