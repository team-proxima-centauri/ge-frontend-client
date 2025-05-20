/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'sidebar': '2px 0 15px 6px rgba(0, 0, 0, 0.2)',
        'active': 'inset 0 0 15px 2px rgba(0, 0, 0, 0.3)',
      },
      colors: {
        choco: {
          bg: '#FFE9DA',
          card: '#FFD0A1',
          sidebar: '#FFD9CC',
          selected: '#D9BAAF',
          primary: '#000000',
          redbtn: '#FB4747',
          greenbtn: '#0B7D1C',
        },
      },
    },
  },
  plugins: [],
}

