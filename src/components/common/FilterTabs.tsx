import React from 'react';

interface FilterTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  ariaLabel?: string;
}

const FilterTabs: React.FC<FilterTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  ariaLabel = 'カテゴリ'
}) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = categories.indexOf(activeCategory);
    if (e.key === 'ArrowRight') {
      const next = (currentIndex + 1) % categories.length;
      onCategoryChange(categories[next]);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = (currentIndex - 1 + categories.length) % categories.length;
      onCategoryChange(categories[prev]);
      e.preventDefault();
    }
  };

  return (
    <div className="border-b border-whiskyPapa-yellow/20">
      <nav
        className="-mb-px flex space-x-8 overflow-x-auto"
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
      >
        {categories.map((category) => {
          const id = `tab-${category}`;
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              role="tab"
              id={id}
              aria-selected={isActive}
              aria-controls={`panel-${category}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onCategoryChange(category)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${isActive
                ? 'border-whiskyPapa-yellow text-whiskyPapa-yellow'
                : 'border-transparent text-gray-400 hover:text-white hover:border-whiskyPapa-yellow/30'
                }`}
            >
              {category}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FilterTabs;


