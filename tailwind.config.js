/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#F7F7F5",
          surface: "#FFFFFF",
          border: "#E8E8E5",
          text: "#242424",
          muted: "#858585",
          accent: "#7565C9",
          "accent-hover": "#6252B5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 8px rgba(0,0,0,0.035)",
        panel: "0 8px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};