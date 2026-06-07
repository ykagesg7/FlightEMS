import React from 'react';
import { FilterListbox } from './FilterListbox';
import type { FilterListboxOption } from './FilterListbox';
import { FILTER_SEARCH_INPUT_CLASS } from '../testFilterOptionUtils';

type TestSubjectFilterSectionProps = {
  selectedSubject: string;
  selectedSubSubject: string;
  subjectListboxOptions: FilterListboxOption<string>[];
  subSubjectListboxOptions: FilterListboxOption<string>[];
  subjectSearch: string;
  subSubjectSearch: string;
  subjectLoading: boolean;
  subSubjectLoading: boolean;
  subjectSelected: boolean;
  filtersLocked: boolean;
  onSubjectChange: (value: string) => void;
  onSubSubjectChange: (value: string) => void;
  onSubjectSearchChange: (value: string) => void;
  onSubSubjectSearchChange: (value: string) => void;
};

export const TestSubjectFilterSection: React.FC<TestSubjectFilterSectionProps> = ({
  selectedSubject,
  selectedSubSubject,
  subjectListboxOptions,
  subSubjectListboxOptions,
  subjectSearch,
  subSubjectSearch,
  subjectLoading,
  subSubjectLoading,
  subjectSelected,
  filtersLocked,
  onSubjectChange,
  onSubSubjectChange,
  onSubjectSearchChange,
  onSubSubjectSearchChange,
}) => (
  <section className="mb-10 rounded-2xl border border-brand-primary/15 bg-[var(--panel)]/85 p-5 shadow-[0_18px_40px_rgba(11,18,32,0.28)]">
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-primary/70">科目別練習</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">出題条件</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-brand-primary">科目</label>
        <FilterListbox
          value={selectedSubject}
          options={subjectListboxOptions}
          onChange={onSubjectChange}
          disabled={subjectLoading || filtersLocked}
        />
        <input
          type="search"
          value={subjectSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubjectSearchChange(e.target.value)}
          placeholder="科目名で検索"
          className={FILTER_SEARCH_INPUT_CLASS}
          disabled={subjectLoading || filtersLocked}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-brand-primary">サブ科目</label>
        <FilterListbox
          value={selectedSubSubject}
          options={subSubjectListboxOptions}
          onChange={onSubSubjectChange}
          disabled={!subjectSelected || subSubjectLoading || filtersLocked}
        />
        <input
          type="search"
          value={subSubjectSearch}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSubSubjectSearchChange(e.target.value)}
          placeholder="サブ科目名で検索"
          className={FILTER_SEARCH_INPUT_CLASS}
          disabled={!subjectSelected || subSubjectLoading || filtersLocked}
        />
      </div>
    </div>
  </section>
);
