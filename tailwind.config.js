/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        btn: {
          background: 'hsl(var(--btn-background))',
          'background-hover': 'hsl(var(--btn-background-hover))',
        },
        gold: 'var(--color-gold)',
        black: 'var(--color-black)',
        white: 'var(--color-white)',
        'gray-light': 'var(--color-gray-light)',
        'gray-dark': 'var(--color-gray-dark)',
        'gray-medium': 'var(--color-gray-medium)',
        'gray-extralight': 'var(--color-gray-extralight)',
        accent: 'var(--color-red)',
      },
      borderRadius: {
        // ... existing code ...
      },
    },
  },
  plugins: [],
} 