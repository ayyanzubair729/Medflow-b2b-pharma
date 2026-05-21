export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#0EA5A4",
        accent: "#38BDF8",
        background: "#0B1220",
        ink: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        display: ["Sora", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 24, 39, 0.08)",
        card: "0 12px 24px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};
