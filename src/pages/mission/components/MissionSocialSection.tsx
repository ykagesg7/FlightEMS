import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningBenchmarkCard } from '../../dashboard/components/LearningBenchmarkCard';
import { PublicLeaderboardSection } from '../../dashboard/components/PublicLeaderboardSection';
import { fetchMissionSocialMetrics } from '../../../utils/dashboard';

const BORDER = 'border-brand-primary/60';

export const MissionSocialSection: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'mission-social'],
    queryFn: fetchMissionSocialMetrics,
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="mb-6 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-6 animate-pulse h-32" />
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <LearningBenchmarkCard benchmark={data.xpBenchmark} borderColor={BORDER} />
      <PublicLeaderboardSection entries={data.publicLeaderboard} borderColor={BORDER} />
    </div>
  );
};
