/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        smm: {
          blue: '#0F4C81',        // Primary & Button Blue
          'blue-dark': '#0B3860',
          'blue-light': '#1E62A0',
          cyan: '#DFF3FF',        // Light Cyan/Blue for cards, boxes, highlights
          'cyan-border': '#BEE3F8',
          slate: '#F8FAFC',
          'slate-border': '#E2E8F0',
          navy: '#0A2540',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
