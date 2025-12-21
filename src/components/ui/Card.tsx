import React from 'react';
import { cn } from '../../utils';

export type CardVariant = 'default' | 'hud' | 'brand' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Unified Card Component
 * Supports Glassmorphism and various styling variants
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-xl border transition-all duration-200';

  const variantStyles: Record<CardVariant, string> = {
    // Default (Semantic - Context-aware)
    default: 'bg-[color:var(--semantic-surface)] border-[color:var(--semantic-border)]',
    // HUD Style (Cockpit)
    hud: 'bg-[color:var(--panel)] border-[color:var(--hud-primary)] shadow-hud-glow',
    // Whisky Papa Brand (Marketing)
    brand: 'bg-brand-secondary border-brand-primary shadow-lg',
    // Glassmorphism
    glass: 'bg-[color:var(--panel)]/80 backdrop-blur-md border-[color:var(--hud-primary)]/50 shadow-xl',
  };

  const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header Component
 */
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('mb-4 pb-4 border-b border-[color:var(--semantic-border)]/30', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Title Component
 */
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn('text-xl font-bold text-[color:var(--semantic-text)]', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

/**
 * Card Content Component
 */
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('text-[color:var(--semantic-text)]', className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('mt-4 pt-4 border-t border-[color:var(--semantic-border)]/30 flex items-center justify-end gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
};

