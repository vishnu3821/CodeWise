module.exports = {
  content: ['./src/pages/Landing.jsx'],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '100%',
        md: '100%',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: "#2463eb",
        "primary-dark": "#1d4ed8",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  corePlugins: { preflight: false },
};
