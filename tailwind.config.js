export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#7a003d',
        font: '#382a35',
        accent: '#aeb0b6',
        greenaccent: '#007a57',
        darkaccent: '#7a003d',
        lightaccent: '#f6cbcc',
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