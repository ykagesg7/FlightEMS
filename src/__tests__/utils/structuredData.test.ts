import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { LearningContent } from '../../types/learning';
import type { ArticleMeta } from '../../types/articles';
import {
  generateArticleStructuredData,
  generateSearchActionStructuredData,
  generateBreadcrumbStructuredData,
  generateSearchResultsStructuredData,
  generateSiteStructuredData,
  addStructuredDataToDOM,
} from '../../utils/structuredData';

const sampleContent: LearningContent = {
  id: 'CPL-1-1-1',
  title: 'Sample lesson',
  category: '航空法規',
  sub_category: null,
  description: 'Desc line',
  order_index: 1,
  parent_id: null,
  content_type: 'mdx',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
  is_published: true,
};

const sampleMeta: ArticleMeta = {
  title: 'Sample lesson',
  slug: '/articles/CPL-1-1-1',
  tags: ['tag1', 'tag2'],
  readingTime: 15,
  excerpt: 'Excerpt text',
};

describe('structuredData generators', () => {
  it('generateArticleStructuredData builds Article JSON-LD', () => {
    const base = 'https://example.test';
    const data = generateArticleStructuredData(sampleContent, sampleMeta, base);
    expect(data['@type']).toBe('Article');
    expect(data.headline).toBe('Sample lesson');
    expect(data.description).toBe('Desc line');
    expect(data.url).toBe(`${base}/articles/CPL-1-1-1`);
    expect(data.keywords).toEqual(['tag1', 'tag2']);
    expect(data.articleSection).toBe('航空法規');
    expect(data.timeRequired).toBe('PT15M');
    expect(data.wordCount).toBe(1000);
    expect(data.inLanguage).toBe('ja');
  });

  it('generateSearchActionStructuredData uses urlTemplate', () => {
    const data = generateSearchActionStructuredData('https://x.test');
    expect(data['@type']).toBe('SearchAction');
    expect(data.target.urlTemplate).toContain('/articles?q={search_term_string}');
  });

  it('generateBreadcrumbStructuredData encodes category in URL', () => {
    const data = generateBreadcrumbStructuredData('Cat A', 'Title B', 'https://x.test');
    expect(data['@type']).toBe('BreadcrumbList');
    expect(data.itemListElement).toHaveLength(4);
    expect(data.itemListElement[2].item).toContain(encodeURIComponent('Cat A'));
  });

  it('generateSearchResultsStructuredData maps results to ItemList', () => {
    const data = generateSearchResultsStructuredData(
      'query',
      [{ content: sampleContent, meta: sampleMeta }],
      'https://x.test',
    );
    expect(data['@type']).toBe('SearchResultsPage');
    expect(data.mainEntity.numberOfItems).toBe(1);
    expect(data.mainEntity.itemListElement[0].item.headline).toBe('Sample lesson');
  });

  it('generateSiteStructuredData includes WebSite and SearchAction', () => {
    const data = generateSiteStructuredData('https://x.test');
    expect(data['@type']).toBe('WebSite');
    expect(data.potentialAction['@type']).toBe('SearchAction');
  });
});

describe('addStructuredDataToDOM', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('injects script and replaces existing id', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: 'a',
    };
    addStructuredDataToDOM(payload, 'ld-test');
    const el = document.getElementById('ld-test');
    expect(el?.textContent).toContain('Thing');

    addStructuredDataToDOM({ ...payload, name: 'b' }, 'ld-test');
    const nodes = document.head.querySelectorAll('#ld-test');
    expect(nodes.length).toBe(1);
    expect(nodes[0]?.textContent).toContain('"b"');
  });
});
