import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, Typography } from '../../../components/ui';
import { CohortRegistrationCta } from '../../../components/learning/CohortRegistrationCta';
import { useCohortProfile } from '../../../hooks/useCohortProfile';
import {
  formatCohortAwardTierHint,
  formatCohortKeyLabel,
  formatCohortPhaseLabel,
  getCohortAwardTier,
} from '../../../utils/cohort';
import { fetchCohortFormationProgress } from '../../../utils/cohortApi';

/**
 * 個人ミッション（コホート）と編隊ゲージをまとめたセクション。
 * 未登録時は登録 CTA のみ表示する。
 */
export const CohortMissionSection: React.FC = () => {
  const { profile, stats, isRegistered, isLoading, isStatsLoading } = useCohortProfile();
  const { data: formationData, isLoading: isFormationLoading } = useQuery({
    queryKey: ['gamification', 'formation-quest'],
    queryFn: fetchCohortFormationProgress,
    staleTime: 30_000,
    enabled: isRegistered,
  });

  if (isLoading) {
    return (
      <Card variant="brand" padding="lg" className="mb-6">
        <Typography variant="body-sm" color="muted">
          受験予定を読み込み中...
        </Typography>
      </Card>
    );
  }

  if (!isRegistered) {
    return (
      <div className="mb-6 max-w-3xl">
        <CohortRegistrationCta
          registered={false}
          dismissStorageKey="cohort_cta_dismiss_dashboard_v1"
        />
      </div>
    );
  }

  const participantCount = stats?.participant_count ?? 0;
  const awardTier = stats?.award_tier ?? getCohortAwardTier(participantCount);
  const formation = formationData?.progress;
  const showFormation = !isFormationLoading && formation?.eligible;
  const formationPct = showFormation
    ? Math.min(100, Math.max(0, formation.shared_progress_pct ?? 0))
    : 0;

  return (
    <div className="mb-6 max-w-3xl space-y-4">
      <Card variant="brand" padding="lg">
        <Typography variant="h3" color="brand" className="text-lg font-bold mb-1">
          受験予定 — {formatCohortKeyLabel(profile?.cohort_key)}
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-4">
          {profile?.cohort_phase === 'post_written'
            ? `${formatCohortPhaseLabel('post_written')} — 実技・FMT 記事を中心に学習しましょう`
            : awardTier === 'top3'
              ? '今週のミッションに参加中 — 週次 TOP3 バッジの対象'
              : awardTier === 'mvp'
                ? '今週のミッションに参加中 — 週次 MVP バッジの対象'
                : '今週のミッションに参加中（公開ランキングはありません）'}
        </Typography>

        {isStatsLoading ? (
          <Typography variant="body-sm" color="muted">
            統計を読み込み中...
          </Typography>
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

        {profile?.cohort_phase !== 'post_written' && (
          <Typography variant="body-sm" color="muted" className="mb-3">
            {formatCohortAwardTierHint(participantCount, awardTier)}
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

      {showFormation && formation && (
        <Card variant="hud" padding="md" className="border-brand-primary/40">
          <CardContent>
            <Typography variant="caption" color="muted" className="mb-1">
              編隊ミッション（みんなで進める）
            </Typography>
            <Typography variant="h3" color="brand" className="mb-2">
              {formation.mission_title ?? '週間ミッション'}
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-3">
              コホートの半数が達成すると全員にボーナス XP。あなた
              {formation.my_qualification_met ? 'は達成済み' : 'はまだ未達成'}です。
            </Typography>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/30">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-500"
                style={{ width: `${formationPct}%` }}
              />
            </div>
            <Typography variant="caption" color="muted" className="mt-2">
              達成 {formation.qualified_count}/{formation.shared_threshold} 名
              {formation.shared_complete ? ' · 編隊ボーナス確定' : ''}
            </Typography>
            <div className="mt-4">
              <Link
                to="/test"
                className="inline-flex items-center justify-center rounded-lg border border-brand-primary/50 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
              >
                ミッションを進める
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CohortMissionSection;
