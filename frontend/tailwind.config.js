/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          950: '#070708', // deeper near-black
          900: '#0F0F10', // charcoal
          800: '#1A1A1C', // card body
          700: '#2A2A2D', // border thick
          600: '#3D3D42', // border light
          400: '#A1A1AA', // muted text
          200: '#E4E4E7', // clean white
        },
        accent: {
          green: '#00FF66', // terminal green
          orange: '#FF5C00', // orange notification/badge
          blue: '#00E0FF', // info
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'Courier', 'monospace'],
      },
      borderWidth: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
      }
    },
  },
  plugins: [],
}
