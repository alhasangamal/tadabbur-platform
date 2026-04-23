/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#022c22',
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
        },
        gold: {
          900: '#713f12',
          800: '#854d0e',
          700: '#a16207',
          600: '#ca8a04',
          500: '#eab308',
          400: '#facc15',
          300: '#fde047',
          200: '#fef08a',
          light: '#fef08a',
          accent: '#d4af37', // Classic metallic gold
        },
        sand: {
          50: '#fdfcf8',   // Clean cream for main bg
          100: '#f9f6f0',  // Slightly darker cream for cards
          200: '#eaddcf',  // Warm light sand
          300: '#d7c0a3',
          400: '#c2a57f',
          800: '#4a3f35',  // Dark brown-sand for text
          900: '#2c251f',
        },
        ink: {
          light: '#4b5563',
          DEFAULT: '#1f2937',
          dark: '#111827',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
        serif: ['Amiri', 'serif'],
        kufi: ['Reem Kufi', 'sans-serif'], // Optional for headings
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'glass-hover': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'pattern-islamic': "url('/assets/images/pattern.png')", // We can add this later or use CSS pattern
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slow-spin': 'spin 12s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
