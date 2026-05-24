const { colors } = require('./constants/colors.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        success: colors.success,
        danger: colors.danger,
        neutral: colors.neutral,
      },
    },
  },
  plugins: [],
};
