/**
 * TianJi Tailwind Config
 *
 * Color values are kept in sync with src/design-system/design-tokens.ts.
 * When updating brand colors, update BOTH files.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tianji: {
          /* Brand accents — synced from design-tokens.ts */
          purple: '#7C3AED',
          'purple-light': '#A78BFA',
          'purple-dark': '#5B21B6',
          gold: '#F59E0B',
          'gold-light': '#FCD34D',

          /* Functional palette */
          cyan: '#06B6D4',
          red: '#EF4444',
          green: '#10B981',

          /* Backgrounds */
          bg: '#030014',
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 4s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'mystic-float': 'mystic-float 8s ease-in-out infinite',
        'mystic-float-delay': 'mystic-float 10s ease-in-out infinite 3s',
      },
    },
  },
  plugins: [],
};
