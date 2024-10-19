/** @type {import('tailwindcss').Config} */

import * as preline from 'preline/plugin'
import tailwindForms from '@tailwindcss/forms'

export default {
  content: [
    'node_modules/preline/dist/*.js',
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [tailwindForms, preline],
}
