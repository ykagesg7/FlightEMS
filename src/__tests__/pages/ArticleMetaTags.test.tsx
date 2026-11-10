import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ArticleMetaTags from '../../pages/articles/components/seo/ArticleMetaTags';

describe('ArticleMetaTags (runtime)', () => {
  it('includes robots noindex when meta.noindex is set', async () => {
    render(
      <HelmetProvider>
        <ArticleMetaTags
          meta={{
            title: 'Stub hub',
            slug: 'cpl-hub-meteorology',
            tags: ['CPL'],
            noindex: true,
            publishedAt: '2026-03-29',
          }}
          url="https://flight-lms.vercel.app/articles/cpl-hub-meteorology"
        />
      </HelmetProvider>,
    );
    await waitFor(() => {
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots?.getAttribute('content')).toBe('noindex');
    });
  });
});
