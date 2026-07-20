import { motion } from 'framer-motion';
import { BookOpenCheck, Route, Trophy } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface MissionRankSectionProps {
  profile: {
    xp_points: number;
  };
}

export const MissionRankSection: React.FC<MissionRankSectionProps> = ({
  profile,
}) => {
  const { data } = useQuery({
    queryKey: ['gamification', 'learning-journey'],
    queryFn: fetchLearningJourney,
    staleTime: 30_000,
  });
  const journey = data?.journey;
  const stageLabel = journey ? STAGE_LABELS[journey.stage] : '準備';
  const stageProgress = journey ? Math.round((journey.stage_order / 6) * 100) : 0;

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light text-center"
      >
        <Route className="mx-auto h-12 w-12 text-whiskyPapa-yellow" aria-hidden />
        <h3 className="text-xl font-bold mt-4 text-whiskyPapa-yellow">{stageLabel}</h3>
        <p className="text-sm text-gray-400 mt-2">
          {journey?.license_target ?? 'CPL'} 学科試験までの現在地
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light"
      >
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-whiskyPapa-yellow" />
          <h3 className="text-xl font-bold">総獲得XP</h3>
        </div>
        <div className="text-4xl font-bold text-whiskyPapa-yellow mb-2">
          {profile.xp_points}
        </div>
        <p className="text-sm text-gray-400">XPは学習行動の記録です。学習段階は習熟証拠で進みます。</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light"
      >
        <div className="flex items-center gap-3 mb-4">
          <BookOpenCheck className="w-6 h-6 text-whiskyPapa-yellow" />
          <h3 className="text-xl font-bold">学習パス進捗</h3>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-4 rounded-full bg-whiskyPapa-yellow"
          />
        </div>
        <p className="text-sm text-gray-400">
          理解確認 {journey?.article_comprehension_count ?? 0}件 · 習熟科目{' '}
          {journey?.mastered_subject_count ?? 0}件
        </p>
      </motion.div>
    </div>
  );
};

