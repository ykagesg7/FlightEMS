import React, { useEffect, useState } from 'react';
import { Typography } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { formatCohortWeeklyBadgeLabel } from '../../../utils/cohort';
import supabase from '../../../utils/supabase';

interface CohortBadgeRow {
  id: string;
  achievement_type: string;
  achieved_at: string | null;
  metadata: Record<string, unknown> | null;
}

function badgeLabel(type: string, metadata: Record<string, unknown> | null): string {
  return formatCohortWeeklyBadgeLabel(type, metadata);
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
          週次 MVP / TOP3 バッジはまだありません。日曜に表彰されます（3 名以上で MVP、10 名以上で TOP3）。
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Typography variant="h4" color="brand" className="text-base font-bold mb-2">
        週次 MVP / TOP3 バッジ
      </Typography>
      <ul className="space-y-2">
        {badges.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-brand-primary/20 px-3 py-2 text-sm"
          >
            {badgeLabel(b.achievement_type, b.metadata)}
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
