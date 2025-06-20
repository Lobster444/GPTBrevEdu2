/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          tertiary: '#3d3d3d',
          accent: '#4d4d4d',
        },
        purple: {
          primary: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
          modal: '#A855F7',
          'modal-hover': '#9333EA',
        },
        yellow: {
          primary: '#FCD34D',
          light: '#FDE68A',
          dark: '#F59E0B',
        },
        gray: {
          text: '#D1D5DB',
          input: '#374151',
          placeholder: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        '28': '1.75rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      // Enhanced z-index scale for proper modal stacking
      zIndex: {
        '9997': '9997', // Course modal backdrop
        '9998': '9998', // Auth modal backdrop  
        '9999': '9999', // Header and highest modals
        '10000': '10000', // Modal content
        '10001': '10001', // Modal close buttons and interactive elements
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'backdrop-fade': 'backdropFade 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        backdropFade: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(4px)' },
        },
      },
      boxShadow: {
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};