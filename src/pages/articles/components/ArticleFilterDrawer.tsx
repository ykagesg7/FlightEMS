import React, { useMemo, useState } from 'react';
import type { ArticleHubStatus } from '../articleHubFilters';

interface ArticleFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  availableTags: string[];
  status: ArticleHubStatus;
  onTagsChange: (tags: string[]) => void;
  onStatusChange: (status: ArticleHubStatus) => void;
}

const STATUS_OPTIONS: { value: ArticleHubStatus; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'in-progress', label: '未読・進行中' },
  { value: 'completed', label: '読了済み' },
];

export const ArticleFilterDrawer: React.FC<ArticleFilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedTags,
  availableTags,
  status,
  onTagsChange,
  onStatusChange,
}) => {
  const [tagQuery, setTagQuery] = useState('');

  const filteredTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((t) => t.toLowerCase().includes(q));
  }, [availableTags, tagQuery]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50"
        aria-label="フィルタを閉じる"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-brand-primary/20 bg-brand-secondary-dark p-5 shadow-xl sm:inset-x-auto sm:right-4 sm:top-24 sm:bottom-auto sm:w-96 sm:rounded-xl"
        role="dialog"
        aria-label="詳細フィルタ"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">詳細フィルタ</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--text-muted)] hover:bg-brand-primary/10 hover:text-brand-primary"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs text-[var(--text-muted)]">進捗</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  status === opt.value
                    ? 'bg-brand-primary text-[var(--bg)]'
                    : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs text-[var(--text-muted)]">タグ</p>
          <input
            type="search"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="タグを検索…"
            className="mb-3 w-full rounded-lg border border-brand-primary/30 bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-brand-primary focus:outline-none"
          />
          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
            {filteredTags.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">該当タグがありません</p>
            ) : (
              filteredTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? 'bg-brand-primary text-[var(--bg)]'
                        : 'border border-brand-primary/25 text-[var(--text-primary)] hover:bg-brand-primary/10'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {(selectedTags.length > 0 || status !== 'all') && (
          <button
            type="button"
            onClick={() => {
              onTagsChange([]);
              onStatusChange('all');
            }}
            className="mt-4 w-full rounded-lg border border-red-500/40 py-2 text-sm text-red-300 hover:bg-red-950/30"
          >
            フィルタをクリア
          </button>
        )}
      </div>
    </>
  );
};
