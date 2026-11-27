import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        logo: ['"Grand Hotel"', 'cursive'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    darkTheme: 'instagram-dark',
    themes: [
      {
        instagram: {
          primary: '#c62a5d',
          'primary-content': '#ffffff',
          secondary: '#e1306c',
          'secondary-content': '#ffffff',
          accent: '#f56040',
          'accent-content': '#ffffff',
          neutral: '#141317',
          'neutral-content': '#f8f8f8',
          'base-100': '#ffffff',
          'base-200': '#f5f5f6',
          'base-300': '#e4e4e7',
          'base-content': '#1f2024',
          info: '#0369a1',
          'info-content': '#ffffff',
          success: '#15803d',
          'success-content': '#ffffff',
          warning: '#a16207',
          'warning-content': '#ffffff',
          error: '#be123c',
          'error-content': '#ffffff',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
        },
      },
      {
        'instagram-dark': {
          primary: '#f43f75',
          'primary-content': '#1a0a10',
          secondary: '#fb7185',
          'secondary-content': '#1a0a10',
          accent: '#fb923c',
          'accent-content': '#1a0a10',
          neutral: '#0b0b0d',
          'neutral-content': '#f5f5f5',
          'base-100': '#141317',
          'base-200': '#1e1d22',
          'base-300': '#2c2b31',
          'base-content': '#e9e9ec',
          info: '#7dd3fc',
          'info-content': '#0b0b0d',
          success: '#4ade80',
          'success-content': '#0b0b0d',
          warning: '#fcd34d',
          'warning-content': '#0b0b0d',
          error: '#fda4af',
          'error-content': '#0b0b0d',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
        },
      },
    ],
  },
};
