/**
 * PPL Rank Badge Component
 * PPLランクを表示するバッジコンポーネント
 */

import React from 'react';
import type { PPLRankDisplay } from '../../types/pplRanks';

interface PPLRankBadgeProps {
  rank: PPLRankDisplay;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const PPLRankBadge: React.FC<PPLRankBadgeProps> = ({
  rank,
  size = 'md',
  showDescription = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border-2 font-semibold ${sizeClasses[size]} ${className}`}
      style={{
        borderColor: rank.color,
        color: rank.color,
        backgroundColor: `${rank.color}15` // 15% opacity
      }}
    >
      <span className={iconSizes[size]}>{rank.icon}</span>
      <span>{rank.rank_name}</span>
      {showDescription && rank.description && (
        <span className="text-xs opacity-75">({rank.description})</span>
      )}
    </div>
  );
};

