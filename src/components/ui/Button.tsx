import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?:    'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary:   'bg-senses-accent text-senses-bg hover:bg-white font-medium',
  secondary: 'bg-senses-surface-2 text-senses-text hover:bg-senses-surface-3 border border-senses-border',
  ghost:     'text-senses-text-2 hover:text-senses-text hover:bg-senses-surface',
  icon:      'text-senses-text-2 hover:text-senses-text hover:bg-senses-surface flex items-center justify-center',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size    = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg
        transition-all duration-[var(--duration-base)] ease-[var(--ease-senses)]
        disabled:opacity-40 disabled:pointer-events-none
        focus-visible:outline-2 focus-visible:outline-senses-accent
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
