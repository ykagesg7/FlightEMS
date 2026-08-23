import articleMetas from 'virtual:articles-index';
import { isWithdrawnArticle } from '../constants/withdrawnArticleIds';
import type { ArticleIndexEntry, ArticleMeta, ArticleNavigation, ArticleSearchOptions, MDXModule } from '../types/articles';
import { isArticleReleased } from './articlePublishGate';

/**
 * MDX 本文ローダーのみ。メタは virtual:articles-index（ビルド時抽出）から読む。
 */
const articleModules = import.meta.glob<MDXModule>('../content/articles/*.mdx', { eager: false });
const lessonModules = import.meta.glob<MDXModule>('../content/lessons/*.mdx', { eager: false });
const allModules = { ...articleModules, ...lessonModules };

export function isLessonContentId(contentId: string): boolean {
  if (!contentId) return false;
  const suffix = `/${contentId}.mdx`;
  return Object.keys(lessonModules).some((path) => path.endsWith(suffix));
}

function loaderFor(filename: string): (() => Promise<MDXModule>) | undefined {
  const suffix = `/${filename}.mdx`;
  for (const [path, loader] of Object.entries(allModules)) {
    if (path.endsWith(suffix)) return loader;
  }
  return undefined;
}

/** Published/emailed Contact stems → CP. Route params and filenames both resolve. */
const ARTICLE_ROUTE_ALIASES: Record<string, string> = {
  'ctx-1-1-area-and-purpose': 'cp-1-1-area-and-purpose',
  'ctx-1-2-energy': 'cp-1-2-energy',
  'ctx-1-3-controls-g-pio': 'cp-1-3-controls-g-pio',
  'CTX-1-1_AreaAndPurpose': 'CP-1-1_AreaAndPurpose',
  'CTX-1-2_Energy': 'CP-1-2_Energy',
  'CTX-1-3_ControlsGPio': 'CP-1-3_ControlsGPio',
};

/**
 * ファイル名からslugを生成（フォールバック用）
 */
function generateSlugFromFilename(filename: string): string {
  return filename
    .replace(/^\d+\.\d+\.\d+_/, '') // 番号プレフィックスを削除
    .replace(/([A-Z])/g, '-$1') // キャメルケースをケバブケースに
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildArticleIndexSync(): ArticleIndexEntry[] {
  const entries: ArticleIndexEntry[] = [];
  const slugSet = new Set<string>();

  for (const [filename, meta] of Object.entries(articleMetas)) {
    if (!meta?.title) {
      if (import.meta.env.DEV) {
        console.warn(`記事 ${filename} にtitleが設定されていません（スキップします）`);
      }
      continue;
    }

    if (isWithdrawnArticle(filename)) {
      continue;
    }

    const loader = loaderFor(filename);
    if (!loader) {
      continue;
    }

    const slug = meta.slug || generateSlugFromFilename(filename);
    if (slugSet.has(slug)) {
      console.error(`重複するslugが検出されました: ${slug} (ファイル: ${filename})`);
      continue;
    }
    slugSet.add(slug);

    const normalizedMeta: ArticleMeta = {
      ...meta,
      slug,
      tags: meta.tags || [],
      type: meta.type || 'article',
      readingTime: meta.readingTime || 5,
    };

    entries.push({
      filename,
      meta: normalizedMeta,
      loader,
    });
  }

  return entries;
}

/** 呼び出し元互換のため async。中身は仮想モジュールからの同期構築。 */
export async function buildArticleIndex(): Promise<ArticleIndexEntry[]> {
  return buildArticleIndexSync();
}

/**
 * 記事インデックスのキャッシュ（結果 + 同時呼び出し用 in-flight Promise）
 */
let cachedIndex: ArticleIndexEntry[] | null = null;
let indexInFlight: Promise<ArticleIndexEntry[]> | null = null;

/**
 * 記事インデックスを取得（キャッシュ付き）
 */
export async function getArticleIndex(): Promise<ArticleIndexEntry[]> {
  if (cachedIndex) {
    return cachedIndex;
  }
  if (!indexInFlight) {
    indexInFlight = buildArticleIndex()
      .then((index) => {
        cachedIndex = index;
        return index;
      })
      .finally(() => {
        indexInFlight = null;
      });
  }
  return indexInFlight;
}

if (import.meta.hot) {
  import.meta.hot.accept('virtual:articles-index', () => {
    cachedIndex = null;
    indexInFlight = null;
  });
}

/** Strip `/articles/` (or leading `/`) so route params match meta.slug. */
export function normalizeArticleSlug(slug: string): string {
  return slug.replace(/^\/articles\//, '').replace(/^\//, '');
}

/**
 * Resolve a route param to an index entry by filename or pretty slug
 * (e.g. `4.1.1_ChoresAreTheJob` or `chores-are-the-job` / `/articles/chores-are-the-job`).
 * Does not apply the publish gate — callers decide release UX.
 */
export async function findArticleByRouteParam(
  param: string,
): Promise<ArticleIndexEntry | null> {
  const index = await getArticleIndex();
  const rawKey = normalizeArticleSlug(param);
  const key = ARTICLE_ROUTE_ALIASES[rawKey] ?? ARTICLE_ROUTE_ALIASES[param] ?? rawKey;
  return (
    index.find((entry) => {
      const metaSlug = entry.meta.slug || '';
      const metaKey = normalizeArticleSlug(metaSlug);
      return (
        entry.filename === param ||
        entry.filename === key ||
        entry.filename === rawKey ||
        metaSlug === param ||
        metaSlug === `/${key}` ||
        metaSlug === `/articles/${key}` ||
        metaSlug === `/articles/${rawKey}` ||
        metaKey === key
      );
    }) ?? null
  );
}

/**
 * slugで記事を検索（公開済みのみ）
 */
export async function getArticleBySlug(slug: string): Promise<ArticleIndexEntry | null> {
  const entry = await findArticleByRouteParam(slug);
  if (!entry) return null;
  if (entry.meta.publishedAt && !isArticleReleased(entry.meta.publishedAt)) {
    return null;
  }
  return entry;
}

/**
 * 記事一覧を取得（検索・フィルタ・ソート付き）
 */
export async function getArticles(options: ArticleSearchOptions = {}): Promise<ArticleIndexEntry[]> {
  const {
    query,
    tags,
    series,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
    publishedOnly = true,
  } = options;

  let articles = await getArticleIndex();

  // 公開済みフィルタ（publishedAt があり、かつ JST 当日以前）
  if (publishedOnly) {
    articles = articles.filter(
      (article) => article.meta.publishedAt && isArticleReleased(article.meta.publishedAt),
    );
  }

  // 検索クエリフィルタ
  if (query) {
    const searchLower = query.toLowerCase();
    articles = articles.filter(article =>
      article.meta.title.toLowerCase().includes(searchLower) ||
      (article.meta.excerpt && article.meta.excerpt.toLowerCase().includes(searchLower)) ||
      article.meta.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // タグフィルタ
  if (tags && tags.length > 0) {
    articles = articles.filter(article =>
      tags.some(tag => article.meta.tags.includes(tag))
    );
  }

  // シリーズフィルタ
  if (series) {
    articles = articles.filter(article => article.meta.series === series);
  }

  // ソート
  articles.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'publishedAt': {
        const dateA = a.meta.publishedAt || '';
        const dateB = b.meta.publishedAt || '';
        comparison = dateA.localeCompare(dateB);
        break;
      }
      case 'title':
        comparison = a.meta.title.localeCompare(b.meta.title);
        break;
      case 'order': {
        const orderA = a.meta.order || 999;
        const orderB = b.meta.order || 999;
        comparison = orderA - orderB;
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return articles;
}

/**
 * 前後の記事を取得
 */
export async function getArticleNavigation(currentSlug: string): Promise<ArticleNavigation> {
  const articles = await getArticles({ sortBy: 'publishedAt', sortOrder: 'desc' });
  const currentIndex = articles.findIndex(article => article.meta.slug === currentSlug);

  if (currentIndex === -1) {
    return {};
  }

  const navigation: ArticleNavigation = {};

  // 前の記事（より新しい記事）
  if (currentIndex > 0) {
    const prevArticle = articles[currentIndex - 1];
    navigation.prev = {
      slug: prevArticle.meta.slug,
      title: prevArticle.meta.title,
    };
  }

  // 次の記事（より古い記事）
  if (currentIndex < articles.length - 1) {
    const nextArticle = articles[currentIndex + 1];
    navigation.next = {
      slug: nextArticle.meta.slug,
      title: nextArticle.meta.title,
    };
  }

  return navigation;
}

/**
 * シリーズ内での前後記事を取得
 */
export async function getSeriesNavigation(currentSlug: string): Promise<ArticleNavigation> {
  const currentArticle = await getArticleBySlug(currentSlug);

  if (!currentArticle || !currentArticle.meta.series) {
    return getArticleNavigation(currentSlug); // フォールバック
  }

  const seriesArticles = await getArticles({
    series: currentArticle.meta.series,
    sortBy: 'order',
    sortOrder: 'asc',
  });

  const currentIndex = seriesArticles.findIndex(article => article.meta.slug === currentSlug);

  if (currentIndex === -1) {
    return {};
  }

  const navigation: ArticleNavigation = {};

  // 前の記事
  if (currentIndex > 0) {
    const prevArticle = seriesArticles[currentIndex - 1];
    navigation.prev = {
      slug: prevArticle.meta.slug,
      title: prevArticle.meta.title,
    };
  }

  // 次の記事
  if (currentIndex < seriesArticles.length - 1) {
    const nextArticle = seriesArticles[currentIndex + 1];
    navigation.next = {
      slug: nextArticle.meta.slug,
      title: nextArticle.meta.title,
    };
  }

  return navigation;
}

/**
 * 関連記事を取得
 */
export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<ArticleIndexEntry[]> {
  const currentArticle = await getArticleBySlug(currentSlug);

  if (!currentArticle) {
    return [];
  }

  const allArticles = await getArticles();
  const currentTags = currentArticle.meta.tags;
  const currentSeries = currentArticle.meta.series;

  // スコアベースで関連度を計算
  const scored = allArticles
    .filter(article => article.meta.slug !== currentSlug)
    .map(article => {
      let score = 0;

      // 同じシリーズの記事は高スコア
      if (currentSeries && article.meta.series === currentSeries) {
        score += 10;
      }

      // 共通タグの数に応じてスコア追加
      const commonTags = article.meta.tags.filter(tag => currentTags.includes(tag));
      score += commonTags.length * 2;

      return { article, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(item => item.article);
}
