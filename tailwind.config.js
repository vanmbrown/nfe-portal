/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'nfe-green': '#103B2A',
        'nfe-green-900': '#0b291e',
        'nfe-green-700': '#14543c',
        'nfe-gold': '#C6A664',
        'nfe-ink': '#111111',
        'nfe-paper': '#FAFAF8',
        'nfe-muted': '#6B6B6B',
      },
      fontFamily: {
        'primary': ['Garamond Premier Pro', 'Georgia', 'serif'],
        'ui': ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
      },
    },
  },
  plugins: [],
}


