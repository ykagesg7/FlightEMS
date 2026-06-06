import React from 'react';

interface AuthTextLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
}

export const AuthTextLink: React.FC<AuthTextLinkProps> = ({
  children,
  onClick,
  type = 'button',
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    className={`text-brand-primary hover:text-brand-primary-light hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors ${className}`}
  >
    {children}
  </button>
);
