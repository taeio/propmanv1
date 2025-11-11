/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        columbia: {
          700: "#E63946",
          900: "#e24a4aff",
        },
        silver: "#C0C0C0",
        red: {
          DEFAULT: "#E63946",
        },
      },
    },
  },
  plugins: [],
};
