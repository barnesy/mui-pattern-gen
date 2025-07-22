/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Only extend, don't override
      colors: {
        // Custom color palette that complements MUI
        brand: {
          primary: '#1976d2',
          secondary: '#dc004e',
        }
      },
      fontFamily: {
        // Keep MUI's font as default, add alternates
        'dm-sans': ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // Only apply when class is added, don't affect MUI inputs
    }),
    require('@tailwindcss/typography'),
  ],
  corePlugins: {
    preflight: false, // Critical: Disable Tailwind's CSS reset
  },
  important: false, // Never use !important - let MUI's specificity win
}