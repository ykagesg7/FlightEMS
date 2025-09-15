import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { ArticleMeta } from '../../types/articles';

interface ArticleMetaTagsProps {
  meta: ArticleMeta;
  url: string;
}

/**
 * 記事用のメタタグコンポーネント
 * OG、Twitter Card、SEO用のメタタグを生成
 */
const ArticleMetaTags: React.FC<ArticleMetaTagsProps> = ({ meta, url }) => {
  const siteName = 'FlightAcademy';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // OG画像の設定（ヒーロー画像または記事内の最初の画像を使用）
  const ogImage = meta.heroImage || `${siteUrl}/images/og-default.jpg`;

  // 記事の説明文
  const description = meta.excerpt || `${meta.title} - ${siteName}で学ぶ航空知識`;

  return (
    <Helmet>
      {/* 基本メタタグ */}
      <title>{meta.title} | {siteName}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={meta.tags?.join(', ')} />
      <meta name="author" content={meta.author || siteName} />

      {/* 公開日・更新日 */}
      {meta.publishedAt && (
        <meta name="article:published_time" content={meta.publishedAt} />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={meta.title} />
      <meta property="og:locale" content="ja_JP" />

      {/* Article specific OG tags */}
      <meta property="article:author" content={meta.author || siteName} />
      {meta.publishedAt && (
        <meta property="article:published_time" content={meta.publishedAt} />
      )}
      {meta.tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      {meta.series && (
        <meta property="article:section" content={meta.series} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={meta.title} />

      {/* 構造化データ用のメタタグ */}
      <meta name="article:reading_time" content={`${meta.readingTime || 5}`} />

      {/* 正規URL */}
      <link rel="canonical" href={url} />

      {/* RSS/Atom フィード（将来実装予定） */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} RSS Feed`}
        href={`${siteUrl}/feed.xml`}
      />

      {/* プリロード用のメタタグ */}
      {meta.heroImage && (
        <link rel="preload" as="image" href={meta.heroImage} />
      )}
    </Helmet>
  );
};

export default ArticleMetaTags;
