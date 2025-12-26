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
 * Supports both Whisky Papa Brand and HUD/Cockpit styles
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    // Whisky Papa Brand (Marketing)
    brand: 'bg-brand-primary text-brand-secondary hover:bg-brand-primary-dark focus:ring-brand-primary shadow-lg hover:shadow-xl',
    // Primary Action (Whisky Papa Yellow)
    primary: 'bg-whiskyPapa-yellow text-black hover:bg-whiskyPapa-yellow/90 focus:ring-whiskyPapa-yellow shadow-lg',
    // Secondary Action (Whisky Papa Outline)
    secondary: 'bg-transparent border-2 border-whiskyPapa-yellow text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 focus:ring-whiskyPapa-yellow',
    // Ghost (Minimal)
    ghost: 'bg-transparent text-white hover:bg-whiskyPapa-yellow/10 focus:ring-whiskyPapa-yellow',
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

