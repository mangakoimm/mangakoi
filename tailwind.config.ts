import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: '#E96B6B', deep: '#D2504F', ink: '#8C3A38' },
        blush: { DEFAULT: '#FFD8D8', soft: '#FFEDED' },
        paper: '#F6F7F9',
        ink: { DEFAULT: '#22201F', soft: '#5B5654' },
        gold: '#E7A94C'
      },
      fontFamily: {
        display: ['var(--font-poppins)', 'sans-serif'],
        body: ['var(--font-noto)', 'sans-serif']
      },
      borderRadius: {
        lg: '18px',
        xl: '24px'
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-16px) rotate(1.5deg)' }
        },
        fall: {
          '0%': { transform: 'translateY(-40px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.85' },
          '100%': { transform: 'translateY(560px) rotate(340deg)', opacity: '0' }
        }
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fall: 'fall linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
