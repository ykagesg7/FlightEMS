import {
  countMindsetArticles,
  CPL_CATEGORY,
  filterPublishedArticleContents,
  isMindsetCategory,
  PPL_CATEGORY,
} from '../../constants/articleHubCategories';
import type { LearningContent } from '../../types';
import type { ArticleMeta } from '../../types/articles';

export type ArticleHubTab = 'continue' | 'cpl' | 'ppl' | 'mindset';
export type ArticleHubSort = 'date' | 'title' | 'readingTime' | 'series';
export type ArticleHubStatus = 'all' | 'in-progress' | 'completed';

export interface ArticleHubState {
  tab: ArticleHubTab;
  query: string;
  tags: string[];
  status: ArticleHubStatus;
  sort: ArticleHubSort;
}

export interface ArticleProgressSnapshot {
  completed?: boolean;
  scrollProgress?: number;
}

export interface FilterArticleHubInput {
  contents: LearningContent[];
  metas: Record<string, ArticleMeta>;
  state: ArticleHubState;
  getProgress: (id: string) => ArticleProgressSnapshot | null;
  socialStats?: Record<string, { likes_count?: number }>;
}

export const DEFAULT_ARTICLE_HUB_STATE: ArticleHubState = {
  tab: 'continue',
  query: '',
  tags: [],
  status: 'all',
  sort: 'date',
};

export const ARTICLE_HUB_TAB_LABELS: Record<ArticleHubTab, string> = {
  continue: '続きから',
  cpl: 'CPL 学科',
  ppl: 'PPL 基礎',
  mindset: 'メンタリティ',
};

const TAB_CATEGORIES: Record<Exclude<ArticleHubTab, 'continue'>, readonly string[]> = {
  cpl: [CPL_CATEGORY],
  ppl: [PPL_CATEGORY],
  mindset: ['メンタリティー', '思考法'],
};

function isArticleCompleted(progress: ArticleProgressSnapshot | null): boolean {
  if (!progress) return false;
  return progress.completed === true || (progress.scrollProgress ?? 0) >= 95;
}

function resolveMeta(
  article: LearningContent,
  metas: Record<string, ArticleMeta>
): ArticleMeta | undefined {
  return (
    metas[article.id] ??
    Object.values(metas).find(
      (m) => m.slug.includes(article.id) || article.title.includes(m.title)
    )
  );
}

function matchesQuery(
  article: LearningContent,
  meta: ArticleMeta | undefined,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    article.title,
    article.description ?? '',
    meta?.series ?? '',
    ...(meta?.tags ?? []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function compareArticles(
  a: LearningContent,
  b: LearningContent,
  sort: ArticleHubSort,
  metas: Record<string, ArticleMeta>,
  _socialStats: Record<string, { likes_count?: number }>
): number {
  const metaA = resolveMeta(a, metas);
  const metaB = resolveMeta(b, metas);

  switch (sort) {
    case 'title':
      return a.title.localeCompare(b.title, 'ja');
    case 'readingTime':
      return (metaA?.readingTime ?? 10) - (metaB?.readingTime ?? 10);
    case 'series': {
      const seriesCmp = (metaA?.series ?? '').localeCompare(metaB?.series ?? '', 'ja');
      if (seriesCmp !== 0) return seriesCmp;
      return (metaA?.order ?? 999) - (metaB?.order ?? 999);
    }
    case 'date':
    default: {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateA - dateB;
    }
  }
}

export function getVisibleTabs(contents: LearningContent[]): ArticleHubTab[] {
  const tabs: ArticleHubTab[] = ['continue'];
  if (contents.some((c) => c.category === CPL_CATEGORY)) tabs.push('cpl');
  if (contents.some((c) => c.category === PPL_CATEGORY)) tabs.push('ppl');
  if (countMindsetArticles(contents) > 0) tabs.push('mindset');
  return tabs;
}

export function normalizeTab(
  tab: string | null,
  visibleTabs: ArticleHubTab[]
): ArticleHubTab {
  if (tab && visibleTabs.includes(tab as ArticleHubTab)) {
    return tab as ArticleHubTab;
  }
  return 'continue';
}

/** Map legacy URL params to canonical hub state (one-time on mount). */
export function parseLegacyArticleHubParams(params: URLSearchParams): Partial<ArticleHubState> {
  const partial: Partial<ArticleHubState> = {};
  const mainFilter = params.get('mainFilter');
  const category = params.get('category');

  if (params.has('tab')) {
    partial.tab = params.get('tab') as ArticleHubTab;
  } else if (mainFilter === '学科' || category === CPL_CATEGORY) {
    partial.tab = 'cpl';
  } else if (category === PPL_CATEGORY) {
    partial.tab = 'ppl';
  } else if (mainFilter === 'マインド' || category === 'メンタリティー' || category === '思考法') {
    partial.tab = 'mindset';
  }

  if (params.has('q')) {
    partial.query = params.get('q') ?? '';
  }

  const tags = params.get('tags');
  if (tags) {
    partial.tags = tags.split(',').filter(Boolean);
  }

  const status = params.get('status');
  if (status === 'in-progress' || status === 'completed') {
    partial.status = status;
  }

  const sort = params.get('sort');
  if (sort === 'title' || sort === 'readingTime' || sort === 'series' || sort === 'date') {
    partial.sort = sort;
  }

  return partial;
}

export function parseArticleHubSearchParams(
  params: URLSearchParams,
  visibleTabs: ArticleHubTab[]
): ArticleHubState {
  const legacy = parseLegacyArticleHubParams(params);
  return {
    ...DEFAULT_ARTICLE_HUB_STATE,
    ...legacy,
    tab: normalizeTab(legacy.tab ?? params.get('tab'), visibleTabs),
    query: params.get('q') ?? legacy.query ?? '',
    tags: legacy.tags ?? (params.get('tags')?.split(',').filter(Boolean) ?? []),
    status:
      legacy.status ??
      (params.get('status') === 'in-progress' || params.get('status') === 'completed'
        ? (params.get('status') as ArticleHubStatus)
        : 'all'),
    sort:
      legacy.sort ??
      (['date', 'title', 'readingTime', 'series'].includes(params.get('sort') ?? '')
        ? (params.get('sort') as ArticleHubSort)
        : 'date'),
  };
}

export function buildArticleHubSearchParams(state: ArticleHubState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.tab !== 'continue') params.set('tab', state.tab);
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.tags.length > 0) params.set('tags', state.tags.join(','));
  if (state.status !== 'all') params.set('status', state.status);
  if (state.sort !== 'date') params.set('sort', state.sort);
  return params;
}

export function filterArticleHubContents(input: FilterArticleHubInput): LearningContent[] {
  const { contents, metas, state, getProgress, socialStats = {} } = input;

  let filtered = contents;

  if (state.tab !== 'continue') {
    const categories = TAB_CATEGORIES[state.tab];
    filtered = filtered.filter((c) => categories.includes(c.category));
  }

  if (state.query.trim()) {
    filtered = filtered.filter((c) => matchesQuery(c, resolveMeta(c, metas), state.query));
  }

  if (state.tags.length > 0) {
    filtered = filtered.filter((c) => {
      const meta = resolveMeta(c, metas);
      return meta ? state.tags.some((tag) => meta.tags.includes(tag)) : false;
    });
  }

  if (state.status === 'completed') {
    filtered = filtered.filter((c) => isArticleCompleted(getProgress(c.id)));
  } else if (state.status === 'in-progress') {
    filtered = filtered.filter((c) => !isArticleCompleted(getProgress(c.id)));
  }

  const sorted = [...filtered].sort((a, b) => compareArticles(a, b, state.sort, metas, socialStats));

  if (state.tab === 'continue') {
    sorted.sort((a, b) => {
      const aDone = isArticleCompleted(getProgress(a.id));
      const bDone = isArticleCompleted(getProgress(b.id));
      if (aDone !== bDone) return aDone ? 1 : -1;
      const metaA = resolveMeta(a, metas);
      const metaB = resolveMeta(b, metas);
      const seriesCmp = (metaA?.series ?? 'zzz').localeCompare(metaB?.series ?? 'zzz', 'ja');
      if (seriesCmp !== 0) return seriesCmp;
      return (metaA?.order ?? 999) - (metaB?.order ?? 999);
    });
  }

  return sorted;
}

export function pickNextToReadArticle(
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): LearningContent | null {
  const bySeries = new Map<string, LearningContent[]>();
  for (const article of contents) {
    const meta = resolveMeta(article, metas);
    if (!meta?.series) continue;
    const list = bySeries.get(meta.series) ?? [];
    list.push(article);
    bySeries.set(meta.series, list);
  }

  let best: LearningContent | null = null;
  let bestOrder = Infinity;

  for (const [, articles] of bySeries) {
    articles.sort(
      (a, b) => (resolveMeta(a, metas)?.order ?? 999) - (resolveMeta(b, metas)?.order ?? 999)
    );
    const next = articles.find((a) => !isArticleCompleted(getProgress(a.id)));
    if (next) {
      const order = resolveMeta(next, metas)?.order ?? 999;
      if (order < bestOrder) {
        bestOrder = order;
        best = next;
      }
    }
  }

  if (best) return best;

  return contents.find((c) => !isArticleCompleted(getProgress(c.id))) ?? null;
}

export function computeNextToReadIds(
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  getProgress: (id: string) => ArticleProgressSnapshot | null
): Set<string> {
  const nextIds = new Set<string>();
  const bySeries = new Map<string, LearningContent[]>();
  for (const article of contents) {
    const meta = resolveMeta(article, metas);
    if (!meta?.series) continue;
    const list = bySeries.get(meta.series) ?? [];
    list.push(article);
    bySeries.set(meta.series, list);
  }
  for (const [, articles] of bySeries) {
    articles.sort(
      (a, b) => (resolveMeta(a, metas)?.order ?? 999) - (resolveMeta(b, metas)?.order ?? 999)
    );
    const next = articles.find((a) => !isArticleCompleted(getProgress(a.id)));
    if (next) nextIds.add(next.id);
  }
  return nextIds;
}

export function getTopTags(
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>,
  limit = 12
): string[] {
  const counts = new Map<string, number>();
  for (const content of contents) {
    const meta = resolveMeta(content, metas);
    for (const tag of meta?.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .slice(0, limit)
    .map(([tag]) => tag);
}

export function getAllTags(
  contents: LearningContent[],
  metas: Record<string, ArticleMeta>
): string[] {
  const tags = new Set<string>();
  for (const content of contents) {
    const meta = resolveMeta(content, metas);
    for (const tag of meta?.tags ?? []) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b, 'ja'));
}

export { filterPublishedArticleContents, isMindsetCategory, resolveMeta as getMetaForArticle };
