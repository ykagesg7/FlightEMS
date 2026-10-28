import { describe, expect, it } from 'vitest';
import {
  INDEXABLE_STATIC_PATHS,
  renderRobotsTxt,
  renderSitemapXmlFromWorkspace,
} from '../../../vite/generateSitemap';

describe('generateSitemap', () => {
  const origin = 'https://flight-lms.vercel.app';

  it('renders valid sitemap xml with static hubs and course paths', () => {
    const xml = renderSitemapXmlFromWorkspace(origin);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const path of INDEXABLE_STATIC_PATHS) {
      const loc = path === '/' ? `${origin}/` : `${origin}${path}`;
      expect(xml).toContain(`<loc>${loc}</loc>`);
    }
    expect(xml).toContain('<loc>https://flight-lms.vercel.app/courses/ppl</loc>');
    expect(xml).not.toContain('<loc>https://flight-lms.vercel.app/auth</loc>');
  });

  it('includes Sitemap directive in robots.txt', () => {
    const robots = renderRobotsTxt(origin);
    expect(robots).toContain('Sitemap: https://flight-lms.vercel.app/api/sitemap.xml');
  });
});
