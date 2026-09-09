import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
        dark: {
          DEFAULT: '#0F172A',
          surface: '#1E293B',
          hover: '#334155'
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
          text: '#065F46'
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
          text: '#92400E'
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
          text: '#991B1B'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#0F172A',
          muted: '#64748B'
        }
      },
      borderRadius: {
        'custom': '14px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 20px 30px -10px rgba(15, 23, 42, 0.08), 0 10px 15px -5px rgba(37, 99, 235, 0.06)',
        'glow': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.06)',
        'glass-lg': '0 16px 48px 0 rgba(31, 38, 135, 0.10)',
        'glass-inner': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.88', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
} satisfies Config;

