import React from 'react';
import { Typography } from '../ui/Typography';

interface MfaCodeFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  helperText?: string;
  variant?: 'default' | 'danger';
}

const variantClass: Record<NonNullable<MfaCodeFieldProps['variant']>, string> = {
  default: 'border-brand-primary/30 focus:border-brand-primary focus:ring-brand-primary/50',
  danger: 'border-red-500/30 focus:border-red-500 focus:ring-red-500/50',
};

export const MfaCodeField: React.FC<MfaCodeFieldProps> = ({
  id,
  label = '認証アプリの 6 桁コード',
  value,
  onChange,
  disabled = false,
  helperText,
  variant = 'default',
}) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
      {label}
    </label>
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder="6桁の認証コード"
      className={`w-full rounded-lg border-2 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 ${variantClass[variant]}`}
    />
    {helperText ? (
      <Typography variant="caption" color="muted" className="mt-2 block">
        {helperText}
      </Typography>
    ) : null}
  </div>
);
