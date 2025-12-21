import React from 'react';
import { motion } from 'framer-motion';
import type { UserRank, RankInfo } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';

interface RankBadgeProps {
  rank: UserRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

/**
 * RankBadge Component
 * ユーザーのランクを表示するバッジ
 */
export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  size = 'md',
  showLabel = true,
  animated = false,
}) => {
  const rankInfo: RankInfo = RANK_INFO[rank];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const badgeContent = (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold border-2`}
      style={{
        backgroundColor: `${rankInfo.color}20`,
        borderColor: rankInfo.color,
        color: rankInfo.color,
      }}
    >
      <span>{rankInfo.icon}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {animated ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {badgeContent}
        </motion.div>
      ) : (
        badgeContent
      )}
      {showLabel && (
        <div className={`text-center ${labelSizeClasses[size]}`}>
          <div className="font-bold" style={{ color: rankInfo.color }}>
            {rankInfo.displayName}
          </div>
        </div>
      )}
    </div>
  );
};

export default RankBadge;

