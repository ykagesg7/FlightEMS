import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import { toSitemapArticleEntry } from '../../../api/_lib/sitemapCore';
import { buildRuntimeSitemapXml } from '../../../api/_lib/sitemapHttp';

describe('runtime sitemap API', () => {
  it('returns XML urlset with JST-filtered article locs', async () => {
    const articles = collectArticleMetas().map(({ filename, meta }) =>
      toSitemapArticleEntry(filename, meta),
    );
    const xml = await buildRuntimeSitemapXml(
      { VITE_APP_URL: 'https://flight-lms.vercel.app' },
      { articles },
    );
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://flight-lms.vercel.app/</loc>');
    expect(xml).toContain('<loc>https://flight-lms.vercel.app/articles/');
  });
});
