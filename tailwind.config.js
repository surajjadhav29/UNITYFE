/** @type {import('tailwindcss').Config} */
export default {
  important: '.crm-shell',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        crm: {
          border: '#e8ecf1',
          muted: '#64748b',
          text: '#1e293b',
          primary: '#2563eb',
          surface: '#ffffff',
        },
      },
      boxShadow: {
        rail: '-4px 0 16px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
};
