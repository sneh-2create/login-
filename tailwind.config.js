/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          orange: "#e95028"
        }
      },
      boxShadow: {
        "login-card": "0px 25px 50px 0px rgba(0,0,0,0.15)",
        "brand-strong":
          "0px 4px 6px 0px rgba(249,115,22,0.2),0px 10px 15px 0px rgba(249,115,22,0.2)"
      }
    }
  },
  plugins: []
};
