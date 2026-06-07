import { buildOrderIndex, MAIN_SUBJECT_ORDER, SUB_SUBJECT_ORDER_BY_MAIN } from './cplSyllabusOrder';
import { ALL_SUBJECT_VALUE } from './testHubFilters';

export type FilterOption = {
  value: string;
  label: string;
  count: number;
  avgImportance: number;
};

export type SubSubjectOption = FilterOption & {
  rawValues: string[];
};

export type FilterSortOrder = 'priority' | 'syllabus';

export const ALL_OPTION_VALUE = ALL_SUBJECT_VALUE;
export const EMPTY_SUB_SUBJECT_RAW_VALUES: string[] = [];

export const MAIN_SUBJECT_ORDER_INDEX = buildOrderIndex(MAIN_SUBJECT_ORDER);
export const SUB_SUBJECT_ORDER_INDEX_BY_MAIN = Object.fromEntries(
  Object.entries(SUB_SUBJECT_ORDER_BY_MAIN).map(([mainSubject, labels]) => [mainSubject, buildOrderIndex(labels)]),
) as Record<string, Map<string, number>>;

export const FILTER_SEARCH_INPUT_CLASS =
  'quiz-filter-search block w-full appearance-none rounded-xl border border-brand-primary/15 bg-[var(--panel)]/60 px-4 py-2 text-sm text-[var(--text-primary)] shadow-sm transition placeholder:text-[var(--text-muted)]/80 hover:border-brand-primary/30 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-60';

export const formatFilterOptionLabel = (label: string, count: number) => `${label} (${count}問)`;

export const sortFilterOptionsByPriority = (a: FilterOption, b: FilterOption) => {
  if (b.avgImportance !== a.avgImportance) return b.avgImportance - a.avgImportance;
  if (b.count !== a.count) return b.count - a.count;
  const orderA = MAIN_SUBJECT_ORDER_INDEX.get(a.value) ?? Number.MAX_SAFE_INTEGER;
  const orderB = MAIN_SUBJECT_ORDER_INDEX.get(b.value) ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return a.label.localeCompare(b.label, 'ja');
};

export const sortFilterOptionsBySyllabus = (
  a: FilterOption,
  b: FilterOption,
  orderIndex: Map<string, number> | undefined,
) => {
  const orderA = orderIndex?.get(a.value);
  const orderB = orderIndex?.get(b.value);

  if (orderA !== undefined && orderB !== undefined && orderA !== orderB) {
    return orderA - orderB;
  }
  if (orderA !== undefined) return -1;
  if (orderB !== undefined) return 1;

  return sortFilterOptionsByPriority(a, b);
};

export const sortOptionList = <T extends FilterOption>(
  options: T[],
  comparator: (a: T, b: T) => number,
  pinValue: string = ALL_OPTION_VALUE,
) => {
  const pinnedOption = options.find((option) => option.value === pinValue);
  const rest = options.filter((option) => option.value !== pinValue).sort(comparator);
  return pinnedOption ? [pinnedOption, ...rest] : rest;
};

export const mergeSelectedIntoMatches = <T extends FilterOption>(
  matches: T[],
  selected: T | undefined,
) => {
  if (!selected || matches.some((option) => option.value === selected.value)) {
    return matches;
  }
  const allOption = matches.find((option) => option.value === ALL_OPTION_VALUE);
  const others = matches.filter((option) => option.value !== ALL_OPTION_VALUE);
  return allOption ? [allOption, selected, ...others] : [selected, ...others];
};
