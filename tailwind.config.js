/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        sapphire: {
          lightest: '#E7F0FA',
          light:    '#7BA4D0',
          mid:      '#2E5E99',
          dark:     '#0D2440',
        },
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        lato:     ['var(--font-lato)', 'sans-serif'],
      },
      boxShadow: {
        'sapphire-sm': '0 2px 8px rgba(46,94,153,0.10)',
        'sapphire-md': '0 4px 20px rgba(46,94,153,0.15)',
        'sapphire-lg': '0 8px 40px rgba(13,36,64,0.18)',
      },
      backgroundImage: {
        'sapphire-gradient': 'linear-gradient(135deg, #0D2440 0%, #2E5E99 60%, #7BA4D0 100%)',
        'sapphire-soft':     'linear-gradient(135deg, #E7F0FA 0%, #d4e6f5 100%)',
      },
    },
  },
  plugins: [],
}
