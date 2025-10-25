/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "src/pages/**/*.{js,ts,jsx,tsx}",
    "src/components/**/*.{js,ts,jsx,tsx}",
    "src/app/**/*.{js,ts,jsx,tsx}",
  ],
  /** @type {import('tailwindcss').Config} */
module,exports : {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        columbia: {
          700: "#4A90E2",
          900: "#2C5DAA",
        },
        silver: "#C0C0C0",
        red: {
          DEFAULT: "#E63946",
        },
      },
    },
  },
  plugins: [],
},
}
