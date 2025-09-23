import { LearningContent } from '../types';
import { ArticleMeta } from '../types/articles';

// 構造化データの型定義
interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface ArticleStructuredData extends StructuredData {
  '@type': 'Article';
  headline: string;
  description: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  dateModified: string;
  image?: string;
  url: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords: string[];
  articleSection: string;
  wordCount: number;
  timeRequired: string;
  inLanguage: string;
  isPartOf: {
    '@type': 'WebSite';
    name: string;
    url: string;
  };
}

interface SearchActionStructuredData extends StructuredData {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

interface BreadcrumbStructuredData extends StructuredData {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

// 記事の構造化データを生成
export const generateArticleStructuredData = (
  content: LearningContent,
  meta: ArticleMeta,
  baseUrl: string = 'https://flightacademy.com'
): ArticleStructuredData => {
  const articleUrl = `${baseUrl}/articles/${content.id}`;
  const readingTime = meta.readingTime || 10;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.description || meta.excerpt || '',
    author: {
      '@type': 'Person',
      name: 'Flight Academy Team'
    },
    datePublished: content.created_at || new Date().toISOString(),
    dateModified: content.updated_at || new Date().toISOString(),
    image: meta.image || `${baseUrl}/images/articles/${content.id}.jpg`,
    url: articleUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    keywords: meta.tags,
    articleSection: content.category,
    wordCount: meta.wordCount || 1000,
    timeRequired: `PT${readingTime}M`,
    inLanguage: 'ja',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Flight Academy',
      url: baseUrl
    }
  };
};

// 検索アクションの構造化データを生成
export const generateSearchActionStructuredData = (
  baseUrl: string = 'https://flightacademy.com'
): SearchActionStructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/articles?q={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  };
};

// パンくずリストの構造化データを生成
export const generateBreadcrumbStructuredData = (
  category: string,
  articleTitle: string,
  baseUrl: string = 'https://flightacademy.com'
): BreadcrumbStructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '記事',
        item: `${baseUrl}/articles`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category,
        item: `${baseUrl}/articles?category=${encodeURIComponent(category)}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: articleTitle,
        item: `${baseUrl}/articles/${encodeURIComponent(articleTitle)}`
      }
    ]
  };
};

// 構造化データをDOMに追加
export const addStructuredDataToDOM = (structuredData: StructuredData, id: string) => {
  // 既存の構造化データを削除
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // 新しい構造化データを追加
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);
};

// 複数の構造化データを一括で追加
export const addMultipleStructuredData = (dataArray: Array<{ data: StructuredData; id: string }>) => {
  dataArray.forEach(({ data, id }) => {
    addStructuredDataToDOM(data, id);
  });
};

// 検索結果の構造化データを生成
export const generateSearchResultsStructuredData = (
  searchQuery: string,
  results: Array<{ content: LearningContent; meta: ArticleMeta }>,
  baseUrl: string = 'https://flightacademy.com'
): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `「${searchQuery}」の検索結果`,
    description: `「${searchQuery}」に関する記事の検索結果です。`,
    url: `${baseUrl}/articles?q=${encodeURIComponent(searchQuery)}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: results.length,
      itemListElement: results.map((result, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: result.content.title,
          description: result.content.description || result.meta.excerpt,
          url: `${baseUrl}/articles/${result.content.id}`,
          author: {
            '@type': 'Person',
            name: 'Flight Academy Team'
          },
          datePublished: result.content.created_at,
          keywords: result.meta.tags
        }
      }))
    }
  };
};

// サイト全体の構造化データを生成
export const generateSiteStructuredData = (
  baseUrl: string = 'https://flightacademy.com'
): StructuredData => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flight Academy',
    description: 'パイロットの思考法とメンタリティーを学ぶ学習プラットフォーム',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/articles?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flight Academy',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`
      }
    }
  };
};
