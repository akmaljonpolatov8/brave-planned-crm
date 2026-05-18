/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#46CFB0",
        night: "#031B1B",
        ink: "#081f1f",
        panel: "#0a2626",
        panelSoft: "#113434",
        line: "rgba(70, 207, 176, 0.16)",
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 16px 40px rgba(70, 207, 176, 0.12)",
      },
    },
  },
  plugins: [],
};
