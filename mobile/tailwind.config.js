/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Palette MaTirelire
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        kids: {
          purple: '#9333EA',
          orange: '#F97316',
          pink: '#EC4899',
          yellow: '#EAB308',
        },
      },
      fontFamily: {
        sans: ['Arial', 'system-ui'],
        dyslexic: ['OpenDyslexic-Regular'],
        'dyslexic-bold': ['OpenDyslexic-Bold'],
      },
    },
  },
  plugins: [],
};
