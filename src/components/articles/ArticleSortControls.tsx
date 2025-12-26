import React from 'react';

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

  const sortOptions = [
    { value: 'date', label: '日付', icon: '📅' },
    { value: 'title', label: 'タイトル', icon: '📝' },
    { value: 'readingTime', label: '読了時間', icon: '⏱️' },
    { value: 'popularity', label: '人気度', icon: '🔥' },
    { value: 'category', label: 'カテゴリー', icon: '📂' }
  ];

  return (
    <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">
          📊 記事の並び替え
        </h3>
        <div className="text-xs text-gray-400">
          記事の並び替え設定
        </div>
      </div>

      {/* コントロール */}
      <div className="flex items-center space-x-4">
        {/* ソート基準選択 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">
            並び替え:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1 rounded-md text-sm border-2 transition-colors border-whiskyPapa-yellow/60 text-white bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow"
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
          className="flex items-center space-x-1 px-3 py-1 rounded-md text-sm border-2 transition-all duration-200 hover:scale-105 border-whiskyPapa-yellow/60 text-white bg-gray-800/50 hover:bg-white/10"
          title={`${sortOrder === 'asc' ? '昇順' : '降順'}で並び替え`}
        >
          <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
          <span>{sortOrder === 'asc' ? '昇順' : '降順'}</span>
        </button>

        {/* 現在のソート状態表示 */}
        <div className="text-xs text-gray-400">
          {sortOptions.find(opt => opt.value === sortBy)?.icon}
          {sortOptions.find(opt => opt.value === sortBy)?.label}
          {sortOrder === 'asc' ? ' (昇順)' : ' (降順)'}
        </div>
      </div>
    </div>
  );
};

export default ArticleSortControls;
