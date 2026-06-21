import React, { useEffect, useState } from 'react';
import { Typography } from '../ui';
import type { PublicUserBadge } from '../../utils/cohort';
import { fetchPublicUserBadges } from '../../utils/cohortApi';

interface PublicUserBadgesPanelProps {
  userId: string;
  displayName: string;
  onClose: () => void;
}

function badgeLabel(type: string): string {
  const match = type.match(/cohort_weekly_w(\d)_rank(\d)/);
  if (match) {
    return `週次 TOP${match[2]}（W${match[1]}）`;
  }
  return type;
}

export const PublicUserBadgesPanel: React.FC<PublicUserBadgesPanelProps> = ({
  userId,
  displayName,
  onClose,
}) => {
  const [badges, setBadges] = useState<PublicUserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicUserBadges(userId).then(({ badges: data, error: err }) => {
      if (cancelled) return;
      setLoading(false);
      if (err) {
        setError(err.message);
        return;
      }
      setBadges(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-badges-title"
    >
      <div className="max-w-md w-full rounded-xl border border-brand-primary/30 bg-[var(--panel)] p-6 shadow-xl">
        <Typography variant="h3" color="brand" className="text-lg font-bold mb-1" id="public-badges-title">
          {displayName} のバッジ
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-4">
          週次 TOP3 バッジ（opt-in 公開）
        </Typography>

        {loading && <Typography variant="body-sm" color="muted">読み込み中...</Typography>}
        {error && <Typography variant="body-sm" className="text-red-400">{error}</Typography>}
        {!loading && !error && badges.length === 0 && (
          <Typography variant="body-sm" color="muted">公開中のバッジはありません。</Typography>
        )}
        <ul className="space-y-2 mb-6">
          {badges.map((b) => (
            <li
              key={b.achievement_type}
              className="rounded-lg border border-brand-primary/20 px-3 py-2 text-sm"
            >
              {badgeLabel(b.achievement_type)}
              {b.achieved_at && (
                <span className="ml-2 text-xs text-[var(--text-muted)]">
                  {new Date(b.achieved_at).toLocaleDateString('ja-JP')}
                </span>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-[color:var(--hud-primary)] underline"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
