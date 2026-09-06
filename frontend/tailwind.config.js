/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#19312a",
        citrus: "#ed7a16",
        leaf: "#376b51",
        canvas: "#f7f6f1",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 55px rgba(25, 49, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

