import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { fetchCohortFormationProgress } from '../../../utils/cohortApi';

export const FormationQuestCard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['gamification', 'formation-quest'],
    queryFn: fetchCohortFormationProgress,
    staleTime: 30_000,
  });

  if (isLoading || !data?.progress?.eligible) return null;

  const progress = data.progress;
  const pct = Math.min(100, Math.max(0, progress.shared_progress_pct ?? 0));

  return (
    <Card variant="hud" padding="md" className="mb-8 border-brand-primary/40">
      <CardContent>
        <Typography variant="caption" color="muted" className="mb-1">
          協力型クエスト（編隊）
        </Typography>
        <Typography variant="h3" color="brand" className="mb-2">
          {progress.mission_title ?? '週間ミッション'}
        </Typography>
        <Typography variant="body-sm" color="muted" className="mb-3">
          コホートの半数が達成すると全員にボーナス XP。あなた
          {progress.my_qualification_met ? 'は達成済み' : 'はまだ未達成'}です。
        </Typography>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/30">
          <div
            className="h-full rounded-full bg-brand-primary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <Typography variant="caption" color="muted" className="mt-2">
          達成 {progress.qualified_count}/{progress.shared_threshold} 名
          {progress.shared_complete ? ' · 編隊ボーナス確定' : ''}
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
  );
};

export default FormationQuestCard;
