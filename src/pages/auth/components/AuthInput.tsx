import React from 'react';

const inputClassName =
  'w-full px-3 py-2 min-h-[44px] rounded-md bg-brand-secondary-dark border border-brand-primary/30 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, id, className, ...props }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
      {label}
    </label>
    <input id={id} className={className ? `${inputClassName} ${className}` : inputClassName} {...props} />
  </div>
);
