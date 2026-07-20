import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import type { LearningJourneyStage } from '../../../utils/cohort';
import { fetchLearningJourney } from '../../../utils/cohortApi';

const STAGE_LABELS: Record<LearningJourneyStage, string> = {
  preparation: '準備',
  foundation: '基礎訓練',
  subject_mastery: '科目習熟',
  cross_subject: '横断演習',
  exam_readiness: '試験準備',
  written_complete: '学科試験完了',
};

const STAGE_ACTIONS: Record<
  LearningJourneyStage,
  { label: string; description: string; to: string }
> = {
  preparation: {
    label: '受験予定を設定',
    description: '目標資格と受験月を登録して、学科試験までの学習フェーズを開始します。',
    to: '/profile',
  },
  foundation: {
    label: '基礎記事を学ぶ',
    description: '記事を読み、理解チェックで80%以上を目指しましょう。',
    to: '/articles',
  },
  subject_mastery: {
    label: '復習・弱点を詰める',
    description: '復習待ちの問題と弱点科目の再テストで定着を進めます。',
    to: '/test?mode=review',
  },
  cross_subject: {
    label: '横断演習へ',
    description: '複数科目を組み合わせ、知識を使い分ける練習を進めます。',
    to: '/test?tab=diagnostic',
  },
  exam_readiness: {
    label: '模擬試験へ',
    description: '受験日が近づいています。本番形式で仕上がりを確認しましょう。',
    to: '/test?tab=diagnostic',
  },
  written_complete: {
    label: '次の訓練を確認',
    description: '第1期のゴール達成です。実技課程など第2期の導線は順次追加します。',
    to: '/profile',
  },
};

export const LearningJourneyCard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['gamification', 'learning-journey'],
    queryFn: fetchLearningJourney,
    staleTime: 30_000,
  });

  if (isLoading || !data?.journey) return null;

  const { journey } = data;
  const action = STAGE_ACTIONS[journey.stage];
  const progress = Math.min(100, Math.max(0, (journey.stage_order / 6) * 100));

  return (
    <Card variant="hud" padding="md" className="mb-6 border-brand-primary/60">
      <CardContent>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <Typography variant="caption" color="muted" className="mb-1">
              {journey.license_target} 学科試験までの現在地
            </Typography>
            <Typography variant="h3" color="brand" className="mb-2">
              {STAGE_LABELS[journey.stage]}
            </Typography>
            <Typography variant="body-sm" color="muted" className="mb-3">
              {action.description}
            </Typography>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/30">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Typography variant="caption" color="muted" className="mt-2">
              理解チェック {journey.article_comprehension_count}件 · 再確認待ち{' '}
              {journey.delayed_retention_count ?? 0}件 · 復習待ち{' '}
              {journey.srs_due_count ?? 0}件 · 習熟科目 {journey.mastered_subject_count}件
            </Typography>
          </div>
          <Link
            to={action.to}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-brand-primary/50 px-4 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
          >
            {action.label}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningJourneyCard;
