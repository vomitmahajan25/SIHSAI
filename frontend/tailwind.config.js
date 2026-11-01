/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#102B25",
          dark: "#0B1D19",
          light: "#183D34",
        },
        sage: {
          DEFAULT: "#287A50",
          hover: "#216442",
          light: "#EAF5EE",
        },
        lime: {
          DEFAULT: "#D8F3A5",
          light: "#EEFAD8",
          dark: "#B8DF7A",
        },
        canvas: "#F6F8F2",
        surface: "#FFFFFF",
        ink: {
          primary: "#1C2924",
          secondary: "#64716A",
          muted: "#8E9B95",
        },
        stroke: {
          DEFAULT: "#DDE5DA",
          dark: "#C3CEC0",
        },
        status: {
          success: "#237A4B",
          warning: "#D97706",
          error: "#C2413B",
          info: "#2563EB",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
