/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ecr: {
          charcoal: '#3F4443',
          'charcoal-90': '#535857',
          'charcoal-70': '#6b7170',
          'charcoal-20': '#d4d6d6',
          'charcoal-10': '#eaebeb',
          red: '#D6001C',
          'red-80': '#de3347',
          'red-20': '#f7ccd1',
          'gray-mid': '#919D9D',
          'gray-light': '#BEC6C4',
          white: '#FFFFFF',
          orange: '#FF6720',
          cream: '#EFEADE',
          'cream-80': '#f5f2ec',
          burgundy: '#651C32',
        },
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        ui: ['Montserrat', 'sans-serif'],
        body: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
