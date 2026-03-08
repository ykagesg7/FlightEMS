import React from 'react';
import { cn } from '../../utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'brand';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

/**
 * Unified Button Component
 * Flight Academy Cockpit Academy theme
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    brand: 'bg-brand-primary text-[var(--bg)] hover:bg-brand-primary-dark focus:ring-brand-primary shadow-lg hover:shadow-xl',
    primary: 'bg-brand-primary text-[var(--bg)] hover:bg-brand-primary-dark focus:ring-brand-primary shadow-lg',
    secondary: 'bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
    ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-brand-primary/10 focus:ring-brand-primary',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

