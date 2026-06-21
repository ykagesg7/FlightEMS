import React from 'react';
import { Link } from 'react-router-dom';
import type { ProfileCompletion } from '../../../auth/profileCompletion';
import { Typography } from '../../../components/ui/Typography';

interface ProfileCompletionStripProps {
  completion: ProfileCompletion;
  compact?: boolean;
  className?: string;
}

export const ProfileCompletionStrip: React.FC<ProfileCompletionStripProps> = ({
  completion,
  compact = false,
  className = '',
}) => {
  if (completion.percent >= 100) {
    return null;
  }

  return (
    <div className={className} data-testid="profile-completion-strip">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Typography variant="caption" color="muted" className="font-medium">
          コックピット準備 {completion.percent}%
        </Typography>
        {!compact && completion.nextAction ? (
          <Link
            to={completion.nextAction.href}
            className="text-xs font-medium text-brand-primary underline hover:no-underline"
          >
            次: {completion.nextAction.label}
          </Link>
        ) : null}
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-brand-primary/15"
        role="progressbar"
        aria-valuenow={completion.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="プロフィール完成度"
      >
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-300"
          style={{ width: `${completion.percent}%` }}
        />
      </div>
      {compact && completion.nextAction ? (
        <Link
          to={completion.nextAction.href}
          className="mt-2 block text-xs font-medium text-brand-primary underline hover:no-underline"
        >
          {completion.nextAction.label}
        </Link>
      ) : null}
    </div>
  );
};
