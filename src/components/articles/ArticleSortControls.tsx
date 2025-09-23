import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ArticleSortControlsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string) => void;
  onSortOrderChange: () => void;
}

const ArticleSortControls: React.FC<ArticleSortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange
}) => {
  const { effectiveTheme } = useTheme();

  const sortOptions = [
    { value: 'date', label: '日付', icon: '📅' },
    { value: 'title', label: 'タイトル', icon: '📝' },
    { value: 'readingTime', label: '読了時間', icon: '⏱️' },
    { value: 'popularity', label: '人気度', icon: '🔥' },
    { value: 'category', label: 'カテゴリー', icon: '📂' }
  ];

  return (
    <div className={`p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg ${effectiveTheme === 'dark'
      ? 'hud-surface border-red-500/60 shadow-red-900/20'
      : effectiveTheme === 'day'
        ? 'hud-surface border-green-500/50 shadow-green-900/10'
        : 'hud-surface border-gray-300'
      }`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${effectiveTheme === 'dark'
          ? 'text-gray-300'
          : effectiveTheme === 'day'
            ? 'text-[#39FF14]'
            : 'text-gray-700'
          }`}>
          📊 記事の並び替え
        </h3>
        <div className={`text-xs ${effectiveTheme === 'dark'
          ? 'text-gray-400'
          : effectiveTheme === 'day'
            ? 'text-green-400'
            : 'text-gray-500'
          }`}>
          記事の並び替え設定
        </div>
      </div>

      {/* コントロール */}
      <div className="flex items-center space-x-4">
        {/* ソート基準選択 */}
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${effectiveTheme === 'dark'
            ? 'text-gray-300'
            : effectiveTheme === 'day'
              ? 'text-[#39FF14]'
              : 'text-gray-700'
            }`}>
            並び替え:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={`px-3 py-1 rounded-md text-sm border-2 transition-colors ${effectiveTheme === 'dark'
              ? 'hud-input border-red-500/60 text-white bg-gray-800/50'
              : effectiveTheme === 'day'
                ? 'hud-input border-green-500/50 text-white bg-gray-800/50'
                : 'hud-input border-gray-300 text-gray-900'
              }`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ソート順序切り替え */}
        <button
          onClick={onSortOrderChange}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm border-2 transition-all duration-200 hover:scale-105 ${effectiveTheme === 'dark'
            ? 'hud-input border-red-500/60 text-white bg-gray-800/50 hover:bg-white/10'
            : effectiveTheme === 'day'
              ? 'hud-input border-green-500/50 text-white bg-gray-800/50 hover:bg-white/10'
              : 'hud-input border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          title={`${sortOrder === 'asc' ? '昇順' : '降順'}で並び替え`}
        >
          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          <span>{sortOrder === 'asc' ? '昇順' : '降順'}</span>
        </button>

        {/* 現在のソート状態表示 */}
        <div className={`text-xs ${effectiveTheme === 'dark'
          ? 'text-gray-400'
          : effectiveTheme === 'day'
            ? 'text-green-400'
            : 'text-gray-500'
          }`}>
          {sortOptions.find(opt => opt.value === sortBy)?.icon}
          {sortOptions.find(opt => opt.value === sortBy)?.label}
          {sortOrder === 'asc' ? ' (昇順)' : ' (降順)'}
        </div>
      </div>
    </div>
  );
};

export default ArticleSortControls;
