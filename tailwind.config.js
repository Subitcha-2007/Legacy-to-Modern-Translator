/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F1319',
          surface: '#171C23',
          elevated: '#1D2430',
          border: '#2B3440',
          textPrimary: '#F1F5F9',
          textSecondary: '#98A2B3',
          accent: '#6D8DFF',
          accentHover: '#5B7BE8',
          success: '#39B77A',
          warning: '#E4A63A',
          error: '#E35D6A',
        },
        light: {
          bg: '#F7F8FA',
          surface: '#FFFFFF',
          elevated: '#F1F3F6',
          border: '#DCE1E8',
          textPrimary: '#1D2430',
          textSecondary: '#667085',
          accent: '#4169E1',
          accentHover: '#3358C8',
          success: '#218653',
          warning: '#A66B00',
          error: '#C83C4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      spacing: {
        '8': '8px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
      }
    },
  },
  plugins: [],
};
