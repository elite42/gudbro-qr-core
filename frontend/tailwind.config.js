/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gudbro-red': '#CD0931',
        'gudbro-black': '#000000',
        'gudbro-yellow': '#F8AD16',
        'gudbro-gray-light': '#F2F2F2',
        'gudbro-blue': '#0931CD',
        'gudbro-gray-dark': '#333333',
        'vegan': '#10B981',
        'alert': '#F97316',
        'info': '#3B82F6',
        'allergen': '#EF4444',
      },
    },
  },
  plugins: [],
};
