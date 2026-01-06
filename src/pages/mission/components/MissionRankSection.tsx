import { motion } from 'framer-motion';
import { TrendingUp, Trophy } from 'lucide-react';
import React from 'react';
import RankBadge from '../../../components/marketing/RankBadge';
import { RankInfo } from '../../../types/gamification';

interface MissionRankSectionProps {
  profile: {
    rank: import('../../../types/gamification').UserRank;
    xp_points: number;
  };
  rankInfo: RankInfo;
  xpToNextRank: number;
  rankProgress: number;
}

export const MissionRankSection: React.FC<MissionRankSectionProps> = ({
  profile,
  rankInfo,
  xpToNextRank,
  rankProgress,
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {/* Current Rank */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light text-center"
      >
        <RankBadge rank={profile.rank} size="lg" animated />
        <h3 className="text-xl font-bold mt-4" style={{ color: rankInfo.color }}>
          {rankInfo.displayName}
        </h3>
        <p className="text-sm text-gray-400 mt-2">現在のランク</p>
      </motion.div>

      {/* Current XP */}
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
        <p className="text-sm text-gray-400">
          {rankInfo.nextRank
            ? rankInfo.nextRankXpRequired && rankInfo.nextRankXpRequired > 0
              ? `次のランクまで: ${xpToNextRank} XP`
              : '次のランクは記事完了で到達'
            : '最高ランク達成！'}
        </p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-whiskyPapa-yellow" />
          <h3 className="text-xl font-bold">ランクアップ進捗</h3>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${rankProgress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-4 rounded-full bg-whiskyPapa-yellow"
          />
        </div>
        <p className="text-sm text-gray-400">
          {rankInfo.nextRank
            ? rankInfo.nextRankXpRequired && rankInfo.nextRankXpRequired > 0
              ? `${rankProgress.toFixed(1)}% 完了`
              : '記事完了で進捗'
            : '最高ランク達成'}
        </p>
      </motion.div>
    </div>
  );
};

