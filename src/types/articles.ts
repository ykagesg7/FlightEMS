/**
 * 記事のメタデータ型定義
 */
export interface ArticleMeta {
  /** 記事タイトル */
  title: string;
  /** URL slug（一意） */
  slug: string;
  /** タグ配列 */
  tags: string[];
  /** シリーズ名（任意） */
  series?: string;
  /** シリーズ内での順序（任意） */
  order?: number;
  /** 読了時間（分） */
  readingTime?: number;
  /** 記事の要約・抜粋 */
  excerpt?: string;
  /** 公開日（YYYY-MM-DD形式） */
  publishedAt?: string;
  /** 記事の種類 */
  type?: 'article' | 'lesson';
  /** 著者名（任意） */
  author?: string;
  /** ヒーロー画像URL（任意） */
  heroImage?: string;
}

/**
 * MDXモジュールの型定義
 */
export interface MDXModule {
  default: React.ComponentType;
  meta?: ArticleMeta;
}

/**
 * 記事インデックスのエントリ
 */
export interface ArticleIndexEntry {
  /** ファイル名（拡張子なし） */
  filename: string;
  /** メタデータ */
  meta: ArticleMeta;
  /** MDXモジュール読み込み関数 */
  loader: () => Promise<MDXModule>;
}

/**
 * 記事一覧の検索・フィルタオプション
 */
export interface ArticleSearchOptions {
  /** 検索クエリ */
  query?: string;
  /** タグフィルタ */
  tags?: string[];
  /** シリーズフィルタ */
  series?: string;
  /** ソート順 */
  sortBy?: 'publishedAt' | 'title' | 'order';
  /** ソート方向 */
  sortOrder?: 'asc' | 'desc';
  /** 公開済みのみ */
  publishedOnly?: boolean;
}

/**
 * 記事ナビゲーション情報
 */
export interface ArticleNavigation {
  /** 前の記事 */
  prev?: {
    slug: string;
    title: string;
  };
  /** 次の記事 */
  next?: {
    slug: string;
    title: string;
  };
}
