import React from 'react';
import { Card, CardContent, Typography } from '../../../components/ui';
import { RANK_INFO } from '../../../types/gamification';
import type { LearningXpBenchmark } from '../../../types/dashboard';
import { MIN_POPULATION_FOR_XP_BENCHMARK } from '../../../utils/dashboard';

function approximateUpperTierPercent(percentileStrictlyBelow: number): number {
  const p = Math.round(100 - percentileStrictlyBelow);
  return Math.max(1, Math.min(99, p));
}

interface Props {
  benchmark: LearningXpBenchmark;
  borderColor: string;
}

/**
 * 学習 XP の相対位置（集計のみ・他者の識別子なし）
 */
export const LearningBenchmarkCard: React.FC<Props> = ({ benchmark, borderColor }) => {
  const { populationN, percentile, rankTier, cohortN, cohortPercentile } = benchmark;

  if (populationN < MIN_POPULATION_FOR_XP_BENCHMARK) {
    return (
      <Card variant="hud" padding="md" className={borderColor}>
        <CardContent>
          <Typography variant="caption" color="muted" className="mb-2">
            学習 XP の位置（参考）
          </Typography>
          <Typography variant="body" color="muted">
            参加者が増えると、全体の中での XP の目安を表示できます。引き続き学習をお楽しみください。
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const tierLabel =
    rankTier && rankTier in RANK_INFO ? RANK_INFO[rankTier as keyof typeof RANK_INFO].displayName : 'あなたのランク帯';

  const mainLine =
    percentile != null ? (
      <Typography variant="body" color="muted" className="leading-relaxed">
        学習 XP の分布では、XP があなたより低い学習者が全体（XP を獲得している方）の約{' '}
        <span className="text-brand-primary font-semibold">{percentile}%</span> です。目安として
        <span className="text-brand-primary font-semibold">
          {' '}
          上位 {approximateUpperTierPercent(percentile)}% 付近
        </span>
        と捉えられます（参考値・他者との直接比較ではありません）。
      </Typography>
    ) : (
      <Typography variant="body" color="muted">
        現時点ではパーセンタイルを計算できません。
      </Typography>
    );

  const cohortLine =
    cohortN != null &&
    cohortN >= 5 &&
    cohortPercentile != null &&
    rankTier ? (
      <Typography variant="caption" color="muted" className="mt-3 block leading-relaxed">
        同じランク帯（{tierLabel}）内では、XP があなたより低い方が約 {cohortPercentile}% です（参考）。
      </Typography>
    ) : null;

  return (
    <Card variant="hud" padding="md" className={borderColor}>
      <CardContent>
        <Typography variant="caption" color="muted" className="mb-2">
          学習 XP の位置（参考）
        </Typography>
        {mainLine}
        {cohortLine}
      </CardContent>
    </Card>
  );
};
