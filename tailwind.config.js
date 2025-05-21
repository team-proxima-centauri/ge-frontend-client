/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      spacing: {
        'xxs': 'var(--space-xxs)',
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
      },
      gridTemplateColumns: {
        '4': 'repeat(4, minmax(0, 1fr))',
        '6': 'repeat(6, minmax(0, 1fr))',
      },
      gap: {
        'xxs': 'var(--space-xxs)',
        'xs': 'var(--space-xs)',
        'sm': 'var(--space-sm)',
        'md': 'var(--space-md)',
        'lg': 'var(--space-lg)',
        'xl': 'var(--space-xl)',
      },
      boxShadow: {
        'sidebar': '2px 0 15px 6px rgba(0, 0, 0, 0.2)',
        'active': 'inset 0 0 15px 2px rgba(0, 0, 0, 0.3)',
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        'modal': 'var(--modal-shadow)',
        'toast': 'var(--toast-shadow)',
      },
      borderRadius: {
        'button': 'var(--button-border-radius)',
        'card': 'var(--card-border-radius)',
        'input': 'var(--input-border-radius)',
        'modal': 'var(--modal-border-radius)',
        'toast': 'var(--toast-border-radius)',
      },
      height: {
        'input': 'var(--input-height)',
        'navbar': 'var(--navbar-height)',
      },
      width: {
        'sidebar': 'var(--sidebar-width)',
        'toast': 'var(--toast-max-width)',
      },
      maxWidth: {
        'modal-sm': 'var(--modal-max-width-sm)',
        'modal-md': 'var(--modal-max-width-md)',
        'modal-lg': 'var(--modal-max-width-lg)',
        'toast': 'var(--toast-max-width)',
      },
      colors: {
        choco: {
          // Legacy colors for backward compatibility
          bg: '#FFE9DA',
          card: '#FFD0A1',
          sidebar: '#FFD9CC',
          chocobtn: '#915D26',
          brown: 'rgb(75, 52, 32)',
          brown2: 'rgb(120, 100, 82)',
          selected: '#D9BAAF',
          primary: '#000000',
          redbtn: '#FB4747',
          greenbtn: '#0B7D1C',
        },
        // New chocolate-brown theme
        primary: {
          DEFAULT: '#5D4037', // Deep chocolate brown
          dark: '#3E2723',    // Darker variant
          light: '#8D6E63',   // Lighter variant
        },
        secondary: {
          DEFAULT: '#D7CCC8', // Caramel tan
          light: '#BCAAA4',   // Lighter caramel
        },
        accent: {
          ivory: '#EFEBE9',   // Warm ivory
          green: '#4E6151',   // Muted forest green
        },
        groceryease: {
          bg: '#FFF8F3',      // Off-white background
          surface: '#F5E9DF', // Light beige surface
          text: '#222222',    // Near-black text
          textSecondary: '#555555', // Dark brown-grey text
          border: '#A1887F',  // Medium brown-grey border
        },
        status: {
          success: '#2E7D32',  // Success state
          warning: '#F9A825',  // Warning state
          error: '#C62828',    // Error state
          info: '#0277BD',     // Info state
        },
      },
      screens: {
        'sm': 'var(--breakpoint-sm)',
        'md': 'var(--breakpoint-md)',
        'lg': 'var(--breakpoint-lg)',
        'xl': 'var(--breakpoint-xl)',
        'desktop': '1024px',
        'wide': '1440px',
      },
    },
  },
  plugins: [],
}

