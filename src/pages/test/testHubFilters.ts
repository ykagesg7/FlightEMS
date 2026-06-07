import type { ExamLevelFilter } from './examLevelFilter';
import { parseExamLevelParam } from './examLevelFilter';

export type TestHubTab = 'diagnostic' | 'review' | 'subject' | 'content';
export type TestHubSort = 'priority' | 'syllabus';
export type TestHubMode = 'practice' | 'exam' | 'review';

export const PLACEHOLDER_SUBJECT = '__placeholder__';
export const ALL_SUBJECT_VALUE = 'all';
export const DIAGNOSTIC_DEFAULT_COUNT = 10;

export interface TestHubState {
  tab: TestHubTab;
  subject: string;
  sub: string;
  count: number;
  mode: TestHubMode;
  contentId: string | null;
  exam: ExamLevelFilter;
  sort: TestHubSort;
}

export const DEFAULT_TEST_HUB_STATE: TestHubState = {
  tab: 'diagnostic',
  subject: PLACEHOLDER_SUBJECT,
  sub: ALL_SUBJECT_VALUE,
  count: DIAGNOSTIC_DEFAULT_COUNT,
  mode: 'practice',
  contentId: null,
  exam: 'all',
  sort: 'priority',
};

export const TEST_HUB_TAB_LABELS: Record<TestHubTab, string> = {
  diagnostic: '10問診断',
  review: '弱点復習',
  subject: '科目別',
  content: '記事連動',
};

const VISIBLE_TABS: TestHubTab[] = ['diagnostic', 'review', 'subject'];

export function getVisibleTestHubTabs(contentId: string | null): TestHubTab[] {
  if (contentId) return ['content'];
  return VISIBLE_TABS;
}

export function normalizeTestHubTab(
  tab: string | null,
  contentId: string | null,
  visibleTabs: TestHubTab[]
): TestHubTab {
  if (contentId) return 'content';
  if (tab && visibleTabs.includes(tab as TestHubTab)) {
    return tab as TestHubTab;
  }
  return 'diagnostic';
}

/** Legacy URLs without `tab` → canonical hub state. */
export function parseLegacyTestHubParams(params: URLSearchParams): Partial<TestHubState> {
  const partial: Partial<TestHubState> = {};
  const contentId = params.get('contentId');
  const mode = params.get('mode') as TestHubMode | null;

  if (contentId) {
    partial.contentId = contentId;
    partial.tab = 'content';
  } else if (mode === 'review') {
    partial.tab = 'review';
    partial.mode = 'review';
  } else if (params.has('subject') && params.get('subject') !== PLACEHOLDER_SUBJECT) {
    partial.tab = 'subject';
  } else if (params.has('tab')) {
    partial.tab = params.get('tab') as TestHubTab;
  }

  if (params.has('subject')) partial.subject = params.get('subject') ?? PLACEHOLDER_SUBJECT;
  if (params.has('sub')) partial.sub = params.get('sub') ?? ALL_SUBJECT_VALUE;
  if (params.has('count')) {
    const n = Number(params.get('count'));
    if (Number.isFinite(n) && n > 0) partial.count = n;
  }
  if (mode === 'practice' || mode === 'exam' || mode === 'review') {
    partial.mode = mode;
  }
  if (params.has('exam')) partial.exam = parseExamLevelParam(params.get('exam'));
  if (params.has('sort')) {
    const sort = params.get('sort');
    if (sort === 'priority' || sort === 'syllabus') partial.sort = sort;
  }

  return partial;
}

export function parseTestHubSearchParams(params: URLSearchParams): TestHubState {
  const contentId = params.get('contentId');
  const visibleTabs = getVisibleTestHubTabs(contentId);
  const legacy = parseLegacyTestHubParams(params);

  const tab = normalizeTestHubTab(
    legacy.tab ?? params.get('tab'),
    contentId,
    visibleTabs
  );

  const countRaw = Number(params.get('count') ?? legacy.count ?? DIAGNOSTIC_DEFAULT_COUNT);
  const count = Number.isFinite(countRaw) && countRaw > 0 ? countRaw : DIAGNOSTIC_DEFAULT_COUNT;

  let mode: TestHubMode =
    legacy.mode ??
    (params.get('mode') as TestHubMode | null) ??
    (tab === 'review' ? 'review' : 'practice');
  if (mode !== 'practice' && mode !== 'exam' && mode !== 'review') {
    mode = tab === 'review' ? 'review' : 'practice';
  }

  return {
    ...DEFAULT_TEST_HUB_STATE,
    ...legacy,
    tab,
    subject: legacy.subject ?? params.get('subject') ?? PLACEHOLDER_SUBJECT,
    sub: legacy.sub ?? params.get('sub') ?? ALL_SUBJECT_VALUE,
    count,
    mode,
    contentId: contentId ?? legacy.contentId ?? null,
    exam: legacy.exam ?? parseExamLevelParam(params.get('exam')),
    sort:
      legacy.sort ??
      (params.get('sort') === 'syllabus' ? 'syllabus' : 'priority'),
  };
}

export function buildTestHubSearchParams(state: TestHubState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.contentId) {
    params.set('contentId', state.contentId);
    params.set('tab', 'content');
  } else if (state.tab !== 'diagnostic') {
    params.set('tab', state.tab);
  }

  if (state.tab === 'subject' || state.subject !== PLACEHOLDER_SUBJECT) {
    if (state.subject !== PLACEHOLDER_SUBJECT) {
      params.set('subject', state.subject);
    }
  }

  if (state.sub !== ALL_SUBJECT_VALUE) params.set('sub', state.sub);
  if (state.count !== DIAGNOSTIC_DEFAULT_COUNT) params.set('count', String(state.count));

  const effectiveMode =
    state.tab === 'review' ? 'review' : state.tab === 'diagnostic' ? 'practice' : state.mode;
  if (effectiveMode !== 'practice') params.set('mode', effectiveMode);

  if (state.exam !== 'all') params.set('exam', state.exam);
  if (state.sort !== 'priority') params.set('sort', state.sort);

  return params;
}

export function isTestFiltersLocked(state: TestHubState): boolean {
  return state.tab === 'review' || state.tab === 'content' || !!state.contentId;
}

export function hubStateToFetchMode(state: TestHubState): TestHubMode {
  if (state.tab === 'review') return 'review';
  if (state.tab === 'diagnostic') return 'practice';
  return state.mode;
}

export function countActiveTestFilters(state: TestHubState): number {
  let n = 0;
  if (state.exam !== 'all') n += 1;
  if (state.mode === 'exam') n += 1;
  if (state.sub !== ALL_SUBJECT_VALUE) n += 1;
  if (state.count !== DIAGNOSTIC_DEFAULT_COUNT) n += 1;
  if (state.sort !== 'priority') n += 1;
  return n;
}

export interface BuildContentTestLinkInput {
  contentId: string;
  subject: string;
  exam?: ExamLevelFilter;
  count?: number;
}

/** Shared builder for article → quiz deep links. */
export function buildContentTestHref(input: BuildContentTestLinkInput): string {
  const params = new URLSearchParams();
  params.set('tab', 'content');
  params.set('subject', input.subject);
  params.set('sub', ALL_SUBJECT_VALUE);
  params.set('count', String(input.count ?? DIAGNOSTIC_DEFAULT_COUNT));
  params.set('mode', 'practice');
  params.set('contentId', input.contentId);
  if (input.exam === 'ppl') params.set('exam', 'ppl');
  return `/test?${params.toString()}`;
}

export function buildDiagnosticHref(count = DIAGNOSTIC_DEFAULT_COUNT): string {
  const params = new URLSearchParams();
  if (count !== DIAGNOSTIC_DEFAULT_COUNT) params.set('count', String(count));
  return params.toString() ? `/test?${params.toString()}` : '/test';
}

export function buildReviewHref(count = DIAGNOSTIC_DEFAULT_COUNT): string {
  const params = new URLSearchParams();
  params.set('tab', 'review');
  params.set('mode', 'review');
  if (count !== DIAGNOSTIC_DEFAULT_COUNT) params.set('count', String(count));
  return `/test?${params.toString()}`;
}

export function buildWeakSubjectHref(subject: string, count = DIAGNOSTIC_DEFAULT_COUNT): string {
  const params = new URLSearchParams();
  params.set('tab', 'subject');
  params.set('subject', subject);
  params.set('sub', ALL_SUBJECT_VALUE);
  params.set('count', String(count));
  params.set('mode', 'practice');
  return `/test?${params.toString()}`;
}
