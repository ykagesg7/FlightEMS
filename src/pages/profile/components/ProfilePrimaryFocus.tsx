import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { useCohortProfile } from '../../../hooks/useCohortProfile';
import type { LearningJourneyStage } from '../../../utils/cohort';
import { formatCohortKeyLabel, formatCohortPhaseLabel } from '../../../utils/cohort';
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
    to: '/profile?tab=learning',
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
    to: '/articles?hub=fmt',
  },
};

function ExamTargetSummary({
  onEditExam,
}: {
  onEditExam: () => void;
}) {
  const { profile, isLoading, fetchError } = useCohortProfile();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2" aria-busy="true">
        <div className="h-4 w-40 rounded bg-brand-primary/15" />
        <div className="h-3 w-56 rounded bg-brand-primary/10" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Typography variant="body-sm" className="text-red-400">
        受験予定の読み込みに失敗しました。しばらくしてから再度お試しください。
      </Typography>
    );
  }

  const needsExamSetup = !profile?.cohort_key || profile.exam_date_status === 'undecided';

  if (needsExamSetup) {
    return (
      <div className="space-y-3">
        <Typography variant="body-sm" color="muted">
          受験予定がまだ設定されていません。資格と試験月を登録すると、学習の次の一手が決まります。
        </Typography>
        <button
          type="button"
          onClick={onEditExam}
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-[var(--bg)] transition hover:bg-brand-primary-dark"
        >
          受験予定を設定する
        </button>
      </div>
    );
  }

  const licenseLabel = profile.license_target === 'PPL' ? 'PPL（自家用操縦士）' : 'CPL（事業用操縦士）';

  return (
    <div className="space-y-2">
      <Typography variant="body-sm" className="font-medium text-[var(--text-primary)]">
        {licenseLabel}
        {profile.target_test_date ? ` · ${profile.target_test_date.slice(0, 7).replace('-', '年')}月` : ''}
      </Typography>
      <Typography variant="caption" color="muted">
        {formatCohortKeyLabel(profile.cohort_key)} · フェーズ: {formatCohortPhaseLabel(profile.cohort_phase)}
      </Typography>
      <button
        type="button"
        onClick={onEditExam}
        className="text-sm font-medium text-brand-primary underline hover:no-underline"
      >
        受験予定を変更
      </button>
    </div>
  );
}

function NextStudyStep() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gamification', 'learning-journey', 'profile-focus'],
    queryFn: fetchLearningJourney,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2" aria-busy="true">
        <div className="h-4 w-28 rounded bg-brand-primary/15" />
        <div className="h-3 w-full max-w-md rounded bg-brand-primary/10" />
      </div>
    );
  }

  const journey = data?.journey;

  if (isError || !journey) {
    return (
      <div className="space-y-3">
        <Typography variant="body-sm" color="muted">
          学習の進捗を読み込めませんでした。ホームで今日の学習を確認してください。
        </Typography>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-lg border border-brand-primary/50 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
        >
          ホームへ
        </Link>
      </div>
    );
  }

  const action = STAGE_ACTIONS[journey.stage];

  return (
    <div className="space-y-3">
      <Typography variant="body-sm" className="font-medium text-[var(--text-primary)]">
        {STAGE_LABELS[journey.stage]}
      </Typography>
      <Typography variant="body-sm" color="muted">
        {action.description}
      </Typography>
      <Link
        to={action.to}
        className="inline-flex items-center justify-center rounded-lg border border-brand-primary/50 px-4 py-2 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary/10"
      >
        {action.label}
      </Link>
    </div>
  );
}

export const ProfilePrimaryFocus: React.FC<{
  onEditExam: () => void;
}> = ({ onEditExam }) => (
  <Card variant="hud" padding="md" className="mb-6 border-brand-primary/60" data-testid="profile-primary-focus">
    <CardContent>
      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="profile-exam-target-heading">
          <Typography
            id="profile-exam-target-heading"
            variant="caption"
            color="muted"
            className="mb-2 block font-semibold uppercase tracking-wide"
          >
            受験目標
          </Typography>
          <ExamTargetSummary onEditExam={onEditExam} />
        </section>
        <section aria-labelledby="profile-next-step-heading">
          <Typography
            id="profile-next-step-heading"
            variant="caption"
            color="muted"
            className="mb-2 block font-semibold uppercase tracking-wide"
          >
            次の学習ステップ
          </Typography>
          <NextStudyStep />
        </section>
      </div>
    </CardContent>
  </Card>
);
