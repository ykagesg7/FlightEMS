import React from 'react';
import { Link } from 'react-router-dom';
import type { ProfileCompletion } from '../../../auth/profileCompletion';
import { Card, CardContent } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';

interface ProfileCompletionCardProps {
  completion: ProfileCompletion;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ completion }) => {
  if (completion.percent >= 100) {
    return null;
  }

  return (
    <Card variant="brand" padding="md" className="mb-6 border-brand-primary/30">
      <CardContent>
        <div className="mb-3 flex items-center justify-between gap-4">
          <Typography variant="body-sm" className="font-medium text-[var(--text-primary)]">
            コックピット準備 {completion.percent}%
          </Typography>
          <span className="text-xs text-[var(--text-muted)]">
            {completion.completedFields.length} 項目完了
          </span>
        </div>
        <div
          className="mb-4 h-2 overflow-hidden rounded-full bg-brand-primary/15"
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
        {completion.nextAction && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography variant="body-sm" className="font-medium text-[var(--text-primary)]">
                次: {completion.nextAction.label}
              </Typography>
              <Typography variant="caption" color="muted" className="mt-1 block">
                {completion.nextAction.benefit}
              </Typography>
            </div>
            <Link
              to={completion.nextAction.href}
              className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-medium text-[var(--bg)] shadow-lg transition-all hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              設定する
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
