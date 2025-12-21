import React from 'react';
import { cn } from '../../utils';

export type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'mono';
export type TypographyColor = 'default' | 'muted' | 'primary' | 'brand' | 'hud';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  color?: TypographyColor;
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
}

/**
 * Unified Typography Component
 * Provides consistent typography across the application
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'default',
  as,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<TypographyVariant, { element: keyof JSX.IntrinsicElements; className: string }> = {
    display: {
      element: 'h1',
      className: 'font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
    },
    h1: {
      element: 'h1',
      className: 'font-display text-3xl md:text-4xl font-bold tracking-tight',
    },
    h2: {
      element: 'h2',
      className: 'font-display text-2xl md:text-3xl font-bold tracking-tight',
    },
    h3: {
      element: 'h3',
      className: 'text-xl md:text-2xl font-semibold',
    },
    h4: {
      element: 'h4',
      className: 'text-lg md:text-xl font-semibold',
    },
    h5: {
      element: 'h5',
      className: 'text-base md:text-lg font-medium',
    },
    h6: {
      element: 'h6',
      className: 'text-sm md:text-base font-medium',
    },
    body: {
      element: 'p',
      className: 'font-body text-base leading-relaxed',
    },
    'body-sm': {
      element: 'p',
      className: 'font-body text-sm leading-relaxed',
    },
    caption: {
      element: 'span',
      className: 'font-body text-xs text-[color:var(--semantic-text-muted)]',
    },
    mono: {
      element: 'code',
      className: 'font-mono text-sm',
    },
  };

  const colorStyles: Record<TypographyColor, string> = {
    default: 'text-[color:var(--semantic-text)]',
    muted: 'text-[color:var(--semantic-text-muted)]',
    primary: 'text-[color:var(--semantic-primary)]',
    brand: 'text-brand-primary',
    hud: 'text-[color:var(--hud-primary)]',
  };

  const { element: defaultElement, className: variantClassName } = variantStyles[variant];
  const Component = as || defaultElement;

  return (
    <Component
      className={cn(
        variantClassName,
        colorStyles[color],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

