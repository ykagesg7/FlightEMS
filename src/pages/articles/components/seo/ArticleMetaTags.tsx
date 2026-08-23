import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { ArticleMeta } from '../../../../types/articles';

interface ArticleMetaTagsProps {
  meta: ArticleMeta;
  url: string;
}

/**
 * 記事用のメタタグコンポーネント。
 * OG / Twitter Card / SEO 用メタを生成する。
 */
const ArticleMetaTags: React.FC<ArticleMetaTagsProps> = ({ meta, url }) => {
  const siteName = 'FlightAcademy';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const ogImage = meta.heroImage || `${siteUrl}/images/og-default.jpg`;
  const description = meta.excerpt || `${meta.title} - ${siteName}で学ぶ航空知識`;

  return (
    <Helmet>
      <title>{meta.title} | {siteName}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={meta.tags?.join(', ')} />
      <meta name="author" content={meta.author || siteName} />

      {meta.publishedAt && (
        <meta name="article:published_time" content={meta.publishedAt} />
      )}

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

      <meta property="article:author" content={meta.author || siteName} />
      {meta.publishedAt && (
        <meta property="article:published_time" content={meta.publishedAt} />
      )}
      {meta.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {meta.series && (
        <meta property="article:section" content={meta.series} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={meta.title} />

      <meta name="article:reading_time" content={`${meta.readingTime || 5}`} />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default ArticleMetaTags;
