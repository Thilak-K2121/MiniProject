/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: "#020617",
          accent: "#00C4FF",
          card: "#0B1120",
          glow: "#3B82F6",
        },
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 196, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
