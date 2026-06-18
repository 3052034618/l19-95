/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'monitor-bg': '#0F172A',
        'monitor-card': '#1E293B',
        'monitor-border': '#334155',
        'monitor-muted': '#64748B',
        'risk-urgent': '#EF4444',
        'risk-high': '#F97316',
        'risk-medium': '#F59E0B',
        'risk-low': '#10B981',
        'brand-blue': '#3B82F6',
        'sentiment-positive': '#10B981',
        'sentiment-neutral': '#64748B',
        'sentiment-negative': '#EF4444',
        'keyword-brand': '#3B82F6',
        'keyword-product': '#8B5CF6',
        'keyword-store': '#10B981',
        'keyword-ambassador': '#EC4899',
        'keyword-competitor': '#EF4444',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Noto Sans SC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'count-up': 'countUp 0.8s ease-out',
        'blink': 'blink 1s ease-in-out 3',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
          '50%': { backgroundColor: 'rgba(245, 158, 11, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
