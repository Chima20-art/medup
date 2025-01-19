/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [  "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#dce7ff',
          200: '#a7c4ff',
          300: '#7fa6ff',
          400: '#4a84ff',
          500: '#5b7bf6', // Base primary color
          600: '#455ac4',
          700: '#334199',
          800: '#232a73',
          900: '#131647',
        },
        secondary: '#ffffff', // Replace with your desired secondary color
      },
      fontFamily: {
        sans: ["Poppins_400Regular", "sans-serif"],
        bold: ["Poppins_700Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
}