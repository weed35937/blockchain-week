/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Barlow Semi Condensed', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        'pbw': {
          'red': '#ff1616',
          'yellow': '#ffde59',
          'white': '#ffffff'
        }
      },
    },
  },
  plugins: [],
}