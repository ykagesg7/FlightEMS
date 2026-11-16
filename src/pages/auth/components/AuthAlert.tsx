import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getPreferredScrollBehavior } from '@/utils/preferredScrollBehavior';

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
  /**
   * When true, the banner stays visible but is hidden from assistive tech so
   * field-level errors announced via focus are not duplicated.
   */
  suppressScreenReader?: boolean;
}

export const AuthAlert = forwardRef<HTMLDivElement, AuthAlertProps>(function AuthAlert(
  { variant, children, className = '', suppressScreenReader = false },
  forwardedRef,
) {
  const localRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => localRef.current as HTMLDivElement);

  useEffect(() => {
    const el = localRef.current;
    if (typeof el?.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest', behavior: getPreferredScrollBehavior() });
    }
  }, [children, variant]);

  const isError = variant === 'error';

  const liveRegionProps = suppressScreenReader
    ? ({ 'aria-hidden': true } as const)
    : isError
      ? ({ role: 'alert' } as const)
      : ({ role: 'status', 'aria-live': 'polite', 'aria-atomic': true } as const);

  return (
    <div
      ref={localRef}
      tabIndex={-1}
      className={`mb-4 p-3 border rounded outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 ${variantStyles[variant]} ${className}`}
      {...liveRegionProps}
    >
      {children}
    </div>
  );
});