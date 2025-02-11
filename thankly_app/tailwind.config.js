/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lora', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#8B2252', // Wine
          light: '#B4D8E7',   // Serenity Blue
        },
        background: {
          light: '#FFFFFF',
          dark: '#1a1a1a',
        },
        accent: {
          DEFAULT: '#B4D8E7',
          dark: '#8B2252',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-soft': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

