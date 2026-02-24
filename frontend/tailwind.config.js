/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1C',
        surface: '#0F1629',
        primary: '#4DA3FF',
        secondary: '#7B61FF',
        success: '#2CE6B3',
        warning: '#FFB84D',
        danger: '#FF5A7A',
        'text-primary': '#E6ECFF',
        'text-secondary': '#9FB0D9'
      }
    },
  },
  plugins: [],
}
