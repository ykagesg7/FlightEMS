import React from 'react';

interface ArticleSearchProps {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: string[];
  categories?: string[];
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

const ArticleSearch: React.FC<ArticleSearchProps> = ({
  selectedTags,
  setSelectedTags,
  availableTags,
  categories = [],
  activeCategory = 'すべて',
  onCategoryChange,
  categoryCounts = {}
}) => {

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const handleCategoryClick = (category: string) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };


  return (
    <div className="p-5 rounded-xl border-2 backdrop-blur-sm shadow-lg bg-whiskyPapa-black-dark border-whiskyPapa-yellow/20 shadow-whiskyPapa-yellow/20">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">
          📂 記事のフィルタリング
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="text-xs px-2 py-1 rounded-md border-2 transition-colors duration-200 bg-red-900/30 text-red-300 border-red-500/60 hover:bg-red-800/40"
          >
            タグをクリア
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* カテゴリータブ */}
        {categories.length > 0 && (
          <div>
            <div className="text-xs mb-2 text-gray-400">
              カテゴリーで絞り込み
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                const count = categoryCounts[category] || 0;

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      isActive
                        ? 'bg-whiskyPapa-yellow text-black shadow-whiskyPapa-yellow/50 shadow-lg'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <span>📂</span>
                      <span>{category}</span>
                      {count > 0 && (
                        <span className={`text-xs ${isActive ? 'text-black/80' : 'text-gray-500'}`}>
                          ({count})
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}


        {/* タグフィルター */}
        {availableTags.length > 0 && (
          <div>
            <div className="text-xs mb-2 text-gray-400">
              タグで絞り込み ({selectedTags.length}個選択中)
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? 'bg-whiskyPapa-yellow text-black shadow-whiskyPapa-yellow/50 shadow-lg'
                        : 'bg-gray-800 text-gray-300 border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="truncate">
                      <span>{tag}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ArticleSearch;
