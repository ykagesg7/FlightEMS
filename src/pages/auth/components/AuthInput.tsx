import { Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useId, useState } from 'react';

const inputClassName =
  'w-full px-3 py-2 min-h-[44px] rounded-md bg-brand-secondary-dark border border-brand-primary/30 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors';

const passwordInputClassName = `${inputClassName} pr-11`;

const toggleButtonClassName =
  'absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center rounded-r-md text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary/50';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Screen-reader field error; visible feedback remains on AuthAlert. */
  errorMessage?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  id,
  className,
  type,
  errorMessage,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const isPasswordField = type === 'password';
  const [passwordVisible, setPasswordVisible] = useState(false);
  const toggleId = useId();
  const errorId = useId();

  const resolvedType = isPasswordField ? (passwordVisible ? 'text' : 'password') : type;
  const resolvedInputClassName = className
    ? `${isPasswordField ? passwordInputClassName : inputClassName} ${className}`
    : isPasswordField
      ? passwordInputClassName
      : inputClassName;

  const handleTogglePassword = useCallback(() => {
    setPasswordVisible((visible) => !visible);
  }, []);

  const handleToggleMouseDown = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }, []);

  const togglePressed = passwordVisible;
  const toggleLabel = togglePressed ? 'パスワードを隠す' : 'パスワードを表示';

  const hasError = Boolean(errorMessage);
  const describedBy = [ariaDescribedBy, hasError ? errorId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;

  const inputA11y = {
    'aria-invalid': hasError ? true : false,
    'aria-describedby': describedBy,
  } as const;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-[var(--text-primary)]">
        {label}
      </label>
      {isPasswordField ? (
        <div className="relative">
          <input
            id={id}
            type={resolvedType}
            className={resolvedInputClassName}
            {...inputA11y}
            {...props}
          />
          <button
            id={toggleId}
            type="button"
            aria-pressed={togglePressed}
            aria-controls={id}
            aria-label={toggleLabel}
            className={toggleButtonClassName}
            onClick={handleTogglePassword}
            onMouseDown={handleToggleMouseDown}
          >
            {togglePressed ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        <input id={id} type={type} className={resolvedInputClassName} {...inputA11y} {...props} />
      )}
      {hasError ? (
        <span id={errorId} className="sr-only">
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
};