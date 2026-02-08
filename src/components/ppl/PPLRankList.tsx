/**
 * PPL Rank List Component
 * ユーザーの取得済みPPLランクを一覧表示するコンポーネント
 */

import React from 'react';
import { usePPLRanks } from '../../hooks/usePPLRanks';
import { PPLRankBadge } from './PPLRankBadge';

interface PPLRankListProps {
  className?: string;
  groupBy?: 'level' | 'subject' | 'none';
  showProgress?: boolean;
}

export const PPLRankList: React.FC<PPLRankListProps> = ({
  className = '',
  groupBy = 'level',
  showProgress: _showProgress = false
}) => {
  const { rankDisplays, isLoading, error } = usePPLRanks();

  // useMemo must be called before any early return (rules-of-hooks)
  const groupedRanks = React.useMemo(() => {
    if (groupBy === 'level') {
      const groups: Record<number, typeof rankDisplays> = {};
      rankDisplays.forEach(rank => {
        if (!groups[rank.rank_level]) {
          groups[rank.rank_level] = [];
        }
        groups[rank.rank_level].push(rank);
      });
      return groups;
    } else if (groupBy === 'subject') {
      const groups: Record<string, typeof rankDisplays> = {};
      rankDisplays.forEach(rank => {
        const key = rank.rank_level === 3 ? `Subject ${rank.rank_level}` : 'Other';
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(rank);
      });
      return groups;
    }
    return { all: rankDisplays };
  }, [rankDisplays, groupBy]);

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">ランクを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <p className="text-red-500">ランクの読み込みに失敗しました</p>
        </div>
      </div>
    );
  }

  if (rankDisplays.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-500">まだランクを取得していません</p>
          <p className="text-sm text-gray-400 mt-2">記事を読んでランクを取得しましょう！</p>
        </div>
      </div>
    );
  }

  const levelLabels: Record<number, string> = {
    1: 'Phase ランク',
    2: 'セクション/カテゴリー マスター',
    3: '科目 マスター',
    4: 'PPL 全体マスター'
  };

  return (
    <div className={`${className}`}>
      {Object.entries(groupedRanks).map(([key, ranks]) => (
        <div key={key} className="mb-6">
          {groupBy === 'level' && (
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              {levelLabels[parseInt(key)] || `Level ${key}`}
            </h3>
          )}
          {groupBy === 'subject' && key !== 'all' && (
            <h3 className="text-lg font-bold mb-3 text-gray-800">{key}</h3>
          )}
          <div className="flex flex-wrap gap-3">
            {ranks.map(rank => (
              <PPLRankBadge
                key={rank.rank_code}
                rank={rank}
                size="md"
                showDescription={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

