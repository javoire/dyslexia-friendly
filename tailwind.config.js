import tw_elements from 'tw-elements/dist/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js}',
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {}
  },
  plugins: [tw_elements]
};
