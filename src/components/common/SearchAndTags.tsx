import React, { useEffect, useState } from 'react';

interface SearchAndTagsProps {
  placeholder?: string;
  availableTags: string[];
  value?: string;
  tags?: string[];
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
}

const SearchAndTags: React.FC<SearchAndTagsProps> = ({
  placeholder = '検索...',
  availableTags,
  value = '',
  tags = [],
  onSearch,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [selectedTags, setSelectedTags] = useState<string[]>(tags);

  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  useEffect(() => {
    setSelectedTags(tags);
  }, [tags]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterChange(newTags);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 transition-colors bg-[color:var(--panel)] border-[color:var(--hud-primary)] text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]`}
          aria-label="検索"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="タグフィルタ">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                ? 'bg-[color:var(--hud-dim)] text-[color:var(--hud-primary)] border border-[color:var(--hud-primary)]'
                : 'bg-[color:var(--panel)] text-[color:var(--text-primary)] hover:bg-[color:var(--hud-grid)] border border-[color:var(--hud-primary)]'
                }`}
              aria-pressed={selectedTags.includes(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchAndTags;


