import type { ArticleIndexEntry, ArticleMeta, ArticleNavigation, ArticleSearchOptions, MDXModule } from '../types/articles';

/**
 * 全記事のMDXモジュールを取得
 * import.meta.globを使用して型安全に記事を収集
 */
const articleModules = import.meta.glob<MDXModule>('../content/articles/*.mdx', { eager: false });

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

/**
 * 記事インデックスを構築
 */
export async function buildArticleIndex(): Promise<ArticleIndexEntry[]> {
  const entries: ArticleIndexEntry[] = [];
  const slugSet = new Set<string>();

  for (const [path, moduleLoader] of Object.entries(articleModules)) {
    const filename = path.split('/').pop()?.replace('.mdx', '') || '';

    try {
      // メタデータのみを取得（コンポーネントは読み込まない）
      const module = await moduleLoader();
      const meta = module.meta;

      if (!meta) {
        console.warn(`記事 ${filename} にメタデータが見つかりません`);
        continue;
      }

      // 必須フィールドの検証
      if (!meta.title) {
        console.error(`記事 ${filename} にtitleが設定されていません`);
        continue;
      }

      // slugの設定（未設定の場合はファイル名から生成）
      const slug = meta.slug || generateSlugFromFilename(filename);

      // slug重複チェック
      if (slugSet.has(slug)) {
        console.error(`重複するslugが検出されました: ${slug} (ファイル: ${filename})`);
        continue;
      }
      slugSet.add(slug);

      // デフォルト値の設定
      const normalizedMeta: ArticleMeta = {
        ...meta,
        slug,
        tags: meta.tags || [],
        type: meta.type || 'article',
        readingTime: meta.readingTime || 5, // デフォルト5分
      };

      entries.push({
        filename,
        meta: normalizedMeta,
        loader: moduleLoader,
      });
    } catch (error) {
      console.error(`記事 ${filename} の読み込み中にエラーが発生しました:`, error);
    }
  }

  return entries;
}

/**
 * 記事インデックスのキャッシュ
 */
let cachedIndex: ArticleIndexEntry[] | null = null;

/**
 * 記事インデックスを取得（キャッシュ付き）
 */
export async function getArticleIndex(): Promise<ArticleIndexEntry[]> {
  if (!cachedIndex) {
    cachedIndex = await buildArticleIndex();
  }
  return cachedIndex;
}

/**
 * slugで記事を検索
 */
export async function getArticleBySlug(slug: string): Promise<ArticleIndexEntry | null> {
  const index = await getArticleIndex();
  return index.find(entry => entry.meta.slug === slug) || null;
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

  // 公開済みフィルタ
  if (publishedOnly) {
    articles = articles.filter(article => article.meta.publishedAt);
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
      case 'publishedAt':
        const dateA = a.meta.publishedAt || '';
        const dateB = b.meta.publishedAt || '';
        comparison = dateA.localeCompare(dateB);
        break;
      case 'title':
        comparison = a.meta.title.localeCompare(b.meta.title);
        break;
      case 'order':
        const orderA = a.meta.order || 999;
        const orderB = b.meta.order || 999;
        comparison = orderA - orderB;
        break;
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
