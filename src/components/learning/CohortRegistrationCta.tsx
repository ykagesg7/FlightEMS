import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Typography } from '../ui';

const COHORT_WELCOME_HREF = '/welcome?mode=cohort';

export type CohortRegistrationCtaVariant = 'inline' | 'card';

export interface CohortRegistrationCtaProps {
  registered: boolean;
  variant?: CohortRegistrationCtaVariant;
  dismissStorageKey?: string;
  className?: string;
}

export const CohortRegistrationCta: React.FC<CohortRegistrationCtaProps> = ({
  registered,
  variant = 'card',
  dismissStorageKey,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissStorageKey || typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(dismissStorageKey) === '1') {
        setDismissed(true);
      }
    } catch {
      // ignore
    }
  }, [dismissStorageKey]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (dismissStorageKey && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(dismissStorageKey, '1');
      } catch {
        // ignore
      }
    }
  }, [dismissStorageKey]);

  if (registered || dismissed) {
    return null;
  }

  const content = (
    <>
      <Typography variant="body-sm" color="brand" className="font-semibold mb-1">
        学科試験の受験予定を登録
      </Typography>
      <Typography variant="body-sm" color="muted" className="mb-3">
        試験月または受験日未定を登録すると、同じ試験月の仲間の匿名統計と週次ミッションに参加できます。
      </Typography>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={COHORT_WELCOME_HREF}
          className="text-sm font-medium text-[color:var(--hud-primary)] underline"
        >
          受験予定を登録する
        </Link>
        {dismissStorageKey && (
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs text-[var(--text-muted)] underline"
          >
            後で
          </button>
        )}
      </div>
    </>
  );

  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-4 ${className}`}
      role="region"
      aria-label="受験予定登録の案内"
    >
      {content}
    </div>
  );
};
