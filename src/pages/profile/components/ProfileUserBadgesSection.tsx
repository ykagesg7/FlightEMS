import React, { useEffect, useState } from 'react';
import { Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import supabase from '../../../utils/supabase';

interface CohortBadgeRow {
  id: string;
  achievement_type: string;
  achieved_at: string | null;
  metadata: Record<string, unknown> | null;
}

function badgeLabel(type: string): string {
  const match = type.match(/cohort_weekly_w(\d)_rank(\d)/);
  if (match) {
    return `週次 TOP${match[2]}（ローテ W${match[1]}）`;
  }
  return type;
}

export const ProfileUserBadgesSection: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [badges, setBadges] = useState<CohortBadgeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    void (async () => {
      const { data } = await supabase
        .from('user_achievements')
        .select('id, achievement_type, achieved_at, metadata')
        .eq('user_id', user.id);

      if (cancelled) return;

      const rows = ((data ?? []) as CohortBadgeRow[])
        .filter((row) => row.achievement_type.startsWith('cohort_weekly_'))
        .sort((a, b) => {
          const ta = a.achieved_at ? new Date(a.achieved_at).getTime() : 0;
          const tb = b.achieved_at ? new Date(b.achieved_at).getTime() : 0;
          return tb - ta;
        });
      setBadges(rows);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return null;
  }

  if (badges.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-brand-primary/20 p-4">
        <Typography variant="body-sm" color="muted">
          週次 TOP3 バッジはまだありません。日曜に TOP3 が付与されます（同じ試験月の参加者が 10 名以上）。
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Typography variant="h4" color="brand" className="text-base font-bold mb-2">
        週次 TOP3 バッジ
      </Typography>
      <ul className="space-y-2">
        {badges.map((b) => (
          <li
            key={b.id}
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
    </div>
  );
};
