import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from '../../../components/ui';
import { useCohortProfile } from '../../../hooks/useCohortProfile';
import { MIN_COHORT_FOR_TOP3, formatCohortKeyLabel, formatCohortPhaseLabel } from '../../../utils/cohort';

export const CohortCard: React.FC = () => {
  const { profile, stats, isRegistered, isLoading, isStatsLoading } = useCohortProfile();

  if (isLoading) {
    return (
      <Card variant="brand" padding="lg">
        <Typography variant="body-sm" color="muted">受験予定を読み込み中...</Typography>
      </Card>
    );
  }

  if (!isRegistered) {
    return null;
  }

  const participantCount = stats?.participant_count ?? 0;
  const top3Eligible = participantCount >= MIN_COHORT_FOR_TOP3;

  return (
    <Card variant="brand" padding="lg">
      <Typography variant="h3" color="brand" className="text-lg font-bold mb-1">
        受験予定 — {formatCohortKeyLabel(profile?.cohort_key)}
      </Typography>
      <Typography variant="body-sm" color="muted" className="mb-4">
        {profile?.cohort_phase === 'post_written'
          ? `${formatCohortPhaseLabel('post_written')} — 実技・FMT 記事を中心に学習しましょう`
          : '今週のミッションに参加中（公開 TOP3 榜はありません）'}
      </Typography>

      {isStatsLoading ? (
        <Typography variant="body-sm" color="muted">統計を読み込み中...</Typography>
      ) : (
        <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <dt className="text-[var(--text-muted)]">参加者</dt>
            <dd className="font-semibold text-[var(--text-primary)]">{participantCount} 名</dd>
          </div>
          <div>
            <dt className="text-[var(--text-muted)]">今週の平均正答率</dt>
            <dd className="font-semibold text-[var(--text-primary)]">
              {stats?.avg_accuracy != null ? `${stats.avg_accuracy}%` : '—'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[var(--text-muted)]">今週のミッション</dt>
            <dd className="font-semibold text-[var(--text-primary)]">
              {stats?.mission_title ?? '—'}
            </dd>
            {stats?.mission_description && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{stats.mission_description}</p>
            )}
          </div>
        </dl>
      )}

      {!top3Eligible && (
        <Typography variant="body-sm" color="muted" className="mb-3">
          TOP3 バッジ付与には同じ試験月の参加者が {MIN_COHORT_FOR_TOP3} 名以上必要です（現在 {participantCount} 名）。
        </Typography>
      )}

      {profile?.cohort_phase === 'post_written' && (
        <Link
          to="/articles?hub=fmt"
          className="text-sm font-medium text-[color:var(--hud-primary)] underline"
        >
          FMT 編隊飛行シリーズへ
        </Link>
      )}
    </Card>
  );
};
