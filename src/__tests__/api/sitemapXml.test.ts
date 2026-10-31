import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import { buildSitemapUrlEntries, toSitemapArticleEntry } from '../../../api/_lib/sitemapCore';
import { buildRuntimeSitemapXml } from '../../../api/_lib/sitemapHttp';
import {
  isWithdrawnArticle,
  WITHDRAWN_ARTICLE_IDS,
} from '../../constants/withdrawnArticleIds';
import { articlePrettySlug } from '../../utils/articleCanonicalPath';
import { renderSitemapXmlFromWorkspace } from '../../../vite/generateSitemap';

describe('runtime sitemap API', () => {
  const origin = 'https://flight-lms.vercel.app';

  it('returns XML urlset with JST-filtered article locs', () => {
    const articles = collectArticleMetas().map(({ filename, meta }) =>
      toSitemapArticleEntry(filename, meta),
    );
    const xml = buildRuntimeSitemapXml(
      { VITE_APP_URL: 'https://flight-lms.vercel.app' },
      { articles },
    );
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('<loc>https://flight-lms.vercel.app/</loc>');
    expect(xml).toContain('<loc>https://flight-lms.vercel.app/articles/');
  });

  it('excludes withdrawn article ids and slugs from sitemap locs', () => {
    const articles = collectArticleMetas().map(({ filename, meta }) =>
      toSitemapArticleEntry(filename, meta),
    );
    const locs = buildSitemapUrlEntries(origin, articles);
    const xml = buildRuntimeSitemapXml({ VITE_APP_URL: origin }, { articles });
    const viteXml = renderSitemapXmlFromWorkspace(origin);

    for (const contentId of WITHDRAWN_ARTICLE_IDS) {
      expect(isWithdrawnArticle(contentId)).toBe(true);
      const metaEntry = collectArticleMetas().find((e) => e.filename === contentId);
      if (!metaEntry) continue;
      const slug = articlePrettySlug(metaEntry.meta, contentId);
      const articleLoc = `${origin}/articles/${slug}`;
      const idLoc = `${origin}/articles/${contentId}`;
      expect(locs).not.toContain(articleLoc);
      expect(locs).not.toContain(idLoc);
      expect(xml).not.toContain(`<loc>${articleLoc}</loc>`);
      expect(viteXml).not.toContain(`<loc>${articleLoc}</loc>`);
    }
  });

  it('still lists JST-released non-withdrawn articles', () => {
    const xml = renderSitemapXmlFromWorkspace(origin);
    expect(xml).toContain(
      '<loc>https://flight-lms.vercel.app/articles/unconscious-success</loc>',
    );
  });
});
