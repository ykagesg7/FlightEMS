import React from 'react';
import type { ArticleMeta } from '../../../../types/articles';

interface ArticleJsonLdProps {
  meta: ArticleMeta;
  url: string;
}

/**
 * 記事用のJSON-LD構造化データコンポ�EネンチE
 * SEO向上�EためのArticleスキーマを埋め込み
 */
const ArticleJsonLd: React.FC<ArticleJsonLdProps> = ({ meta, url }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.excerpt || meta.title,
    author: {
      '@type': 'Person',
      name: meta.author || 'FlightAcademy',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlightAcademy',
      logo: {
        '@type': 'ImageObject',
        url: `${typeof window !== 'undefined' ? window.location.origin : ''}/logo.png`, // ロゴのURL
      },
    },
    datePublished: meta.publishedAt,
    dateModified: meta.publishedAt, // 更新日がある場合�E別途追加
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url: url,
    keywords: meta.tags?.join(', '),
    articleSection: meta.series || 'General',
    wordCount: estimateWordCount(meta.excerpt || ''),
    timeRequired: meta.readingTime ? `PT${meta.readingTime}M` : 'PT5M', // ISO 8601 duration format
    inLanguage: 'ja-JP',
    isAccessibleForFree: true,
  };

  // ヒーロー画像がある場合は追加
  if (meta.heroImage) {
    (jsonLd as any).image = {
      '@type': 'ImageObject',
      url: meta.heroImage,
      width: 1200,
      height: 630,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
    />
  );
};

/**
 * 簡単な斁E��数推定（日本語対応！E
 */
function estimateWordCount(text: string): number {
  // 日本語文字（�Eらがな、カタカナ、漢字）と英数字を刁E��てカウンチE
  const japaneseChars = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || [];
  const otherWords = text.replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]/g, ' ').trim().split(/\s+/).filter(word => word.length > 0);

  // 日本語文字�E1斁E��E語、英数字�E単語単位でカウンチE
  return japaneseChars.length + otherWords.length;
}

export default ArticleJsonLd;
