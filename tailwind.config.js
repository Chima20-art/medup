/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [  "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#3D509B', // Replace with your desired primary color
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