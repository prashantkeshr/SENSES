/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        senses: {
          bg:          '#080808',
          'bg-2':      '#0C0C0C',
          surface:     '#111111',
          'surface-2': '#181818',
          'surface-3': '#222222',
          border:      '#252525',
          'border-2':  '#333333',
          text:        '#F0EDE8',
          'text-2':    '#A8A5A0',
          'text-3':    '#666360',
          accent:      '#FF2D55',   // Neon Red
          sight:       '#C8B89A',
          hearing:     '#8FAEC0',
          muted:       '#3A3A3A',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        brand:   ['"Dancing Script"', 'cursive'],
        mono:    ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['clamp(3rem,8vw,6.5rem)',     { lineHeight: '1',    letterSpacing: '-0.04em' }],
        'display-xl':  ['clamp(2.25rem,5vw,4rem)',    { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg':  ['clamp(1.75rem,3vw,2.75rem)', { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'scale-in':     'scaleIn 0.2s ease-out forwards',
        'pulse-soft':   'pulseSoft 2s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2.4s ease-in-out infinite',
        'reveal-up':    'revealUp 0.6s cubic-bezier(0.25,0.1,0.25,1) forwards',
        'float':        'float 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { transform: 'translateY(24px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn:      { '0%': { transform: 'scale(0.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseSoft:    { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        glowPulse:    { '0%,100%': { boxShadow: '0 0 8px rgba(255,45,85,0.4)' }, '50%': { boxShadow: '0 0 22px rgba(255,45,85,0.85)' } },
        revealUp:     { '0%': { transform: 'translateY(18px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float:        { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        slideInRight: { '0%': { transform: 'translateX(20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
      },
      transitionTimingFunction: {
        'senses': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
    },
  },
  plugins: [],
};
