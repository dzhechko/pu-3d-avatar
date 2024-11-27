/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        loading: {
          '0%': { backgroundPosition: '200% 0', opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { backgroundPosition: '-200% 0', opacity: '0.8' },
        },
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-slow-reverse': 'spin 15s linear infinite reverse',
      },
      zIndex: {
        '9999': '9999',
      },
    },
  },
  plugins: [],
}
