import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: { 'xs': '360px' },
      colors: {
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        accent: 'var(--accent)',
      },
    },
  },
  plugins: [],
};
export default config;
