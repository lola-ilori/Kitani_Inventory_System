export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#7a003d',
        font: '#564147',
        accent: '#bb6e11',
        greenaccent: '#007a57',
        darkaccent: '#0a2b3d',
        lightaccent: '#d3b1b1',
        background:'#ffffff'
      },
      fontFamily: {
        mainfont: ["Playfair Display", "serif"],
        otherfont: ["Lora", "serif"]
      }
    },
  },
  plugins: [],
}