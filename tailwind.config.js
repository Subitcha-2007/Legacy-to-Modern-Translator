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
          blue: '#0F4C81',        // Deep Dark Blue Primary
          'blue-dark': '#0B3860',
          'blue-deep': '#1E3A8A', // Deep Dark Blue Accent
          'blue-light': '#1E62A0',
          'bg-light': '#F0F7FF',  // Very Light Blue Primary Background
          'bg-alt': '#F4F9FF',    // Alternate Light Blue Background
          'card-soft': '#E0F2FE', // Soft Light Blue for Cards & Panels
          'panel-soft': '#EBF5FF', // Soft Panel Blue
          'header-soft': '#E0F2FE', // Soft Table Header Blue
          'border-soft': '#BAE6FD', // Soft Blue Border
          'btn-sec-bg': '#E0F2FE',
          'btn-sec-border': '#93C5FD',
          'btn-sec-text': '#0F4C81',
          mint: '#10B981',        // Mint Green
          'mint-dark': '#059669',
          'mint-light': '#34D399',
          slate: '#F0F7FF',       // Updated to light blue palette
          'slate-border': '#BAE6FD',
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
