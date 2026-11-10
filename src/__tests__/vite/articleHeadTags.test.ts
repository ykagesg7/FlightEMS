import { describe, expect, it } from 'vitest';
import { collectArticleMetas } from '../../../vite/articlesMeta';
import { articleHeadTags } from '../../../vite/articleHeadTags';

describe('articleHeadTags (prerender)', () => {
  const origin = 'https://flight-lms.vercel.app';

  it('includes robots noindex for stub hubs with meta.noindex', () => {
    const metas = collectArticleMetas();
    const meteo = metas.find((entry) => entry.filename === 'CPL-Hub-Meteorology');
    const comm = metas.find((entry) => entry.filename === 'CPL-Hub-Communication');
    expect(meteo?.meta.noindex).toBe(true);
    expect(comm?.meta.noindex).toBe(true);

    const head = articleHeadTags(meteo!.meta, meteo!.filename, origin);
    expect(head).toContain('name="robots" content="noindex"');
  });

  it('omits robots noindex for released navigation hub', () => {
    const metas = collectArticleMetas();
    const nav = metas.find((entry) => entry.filename === 'CPL-Hub-Navigation');
    expect(nav).toBeDefined();
    const head = articleHeadTags(nav!.meta, nav!.filename, origin);
    expect(head).not.toContain('name="robots" content="noindex"');
    expect(head).toContain('cpl-hub-navigation');
  });
});
