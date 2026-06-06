import React from 'react';

type AuthAlertVariant = 'error' | 'success' | 'timeout';

const variantStyles: Record<AuthAlertVariant, string> = {
  error: 'bg-red-500/20 border-red-500/50 text-red-300',
  success: 'bg-green-500/20 border-green-500/50 text-green-300',
  timeout: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
};

interface AuthAlertProps {
  variant: AuthAlertVariant;
  children: React.ReactNode;
  className?: string;
}

export const AuthAlert: React.FC<AuthAlertProps> = ({ variant, children, className = '' }) => (
  <div
    className={`mb-4 p-3 border rounded ${variantStyles[variant]} ${className}`}
    role={variant === 'error' ? 'alert' : 'status'}
  >
    {children}
  </div>
);
