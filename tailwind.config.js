/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

theme: {
  extend: {
    colors: {
      columbia: {
        700: "#4A90E2",
        900: "#2C5DAA",
      },
      silver: "#C0C0C0",
      red, {
        DEFAULT: "#E63946",
      };
    };
  };
};
};
