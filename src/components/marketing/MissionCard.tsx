import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, Clock } from 'lucide-react';
import type { Mission, UserRank } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';

interface MissionCardProps {
  mission: Mission;
  isCompleted?: boolean;
  completedAt?: string;
  userRank?: UserRank;
}

/**
 * MissionCard Component
 * ミッション詳細とアクションボタンを表示
 */
export const MissionCard: React.FC<MissionCardProps> = ({
  mission,
  isCompleted = false,
  completedAt,
  userRank = 'spectator',
}) => {
  const rankInfo = RANK_INFO[mission.min_rank_required];
  const isLocked = userRank < mission.min_rank_required;

  const getActionLink = () => {
    switch (mission.required_action) {
      case 'quiz_pass':
        return '/test';
      case 'plan_create':
        return '/planning';
      case 'article_read':
        return '/articles';
      case 'lesson_complete':
        return '/articles';
      default:
        return '#';
    }
  };

  const getActionLabel = () => {
    switch (mission.required_action) {
      case 'quiz_pass':
        return 'クイズに挑戦';
      case 'plan_create':
        return 'プランを作成';
      case 'article_read':
        return '記事を読む';
      case 'lesson_complete':
        return 'レッスンを開始';
      default:
        return '開始';
    }
  };

  const getMissionTypeIcon = () => {
    switch (mission.mission_type) {
      case 'daily':
        return <Clock className="w-4 h-4" />;
      case 'weekly':
        return <Clock className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-6 rounded-lg border-2 transition-all
        ${
          isCompleted
            ? 'border-whiskyPapa-yellow/50 bg-whiskyPapa-yellow/10'
            : isLocked
            ? 'border-gray-600/30 bg-gray-800/30 opacity-60'
            : 'border-whiskyPapa-yellow/30 bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60'
        }
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-whiskyPapa-yellow" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <h3
              className={`font-bold text-lg ${
                isCompleted ? 'text-whiskyPapa-yellow' : 'text-white'
              }`}
            >
              {mission.title}
            </h3>
            <div className="ml-auto flex items-center gap-1 text-gray-400">
              {getMissionTypeIcon()}
            </div>
          </div>
          {mission.description && (
            <p className="text-gray-300 text-sm mb-3">{mission.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${rankInfo.color}20`,
              color: rankInfo.color,
            }}
          >
            {rankInfo.displayName}以上
          </div>
          <div className="flex items-center gap-1 text-whiskyPapa-yellow">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{mission.xp_reward} XP</span>
          </div>
        </div>

        {isCompleted ? (
          <div className="text-sm text-gray-400">
            {completedAt &&
              `達成: ${new Date(completedAt).toLocaleDateString('ja-JP')}`}
          </div>
        ) : isLocked ? (
          <div className="text-sm text-gray-500">ロック中</div>
        ) : (
          <Link
            to={getActionLink()}
            className="px-4 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow-light transition-colors text-sm"
          >
            {getActionLabel()}
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default MissionCard;

