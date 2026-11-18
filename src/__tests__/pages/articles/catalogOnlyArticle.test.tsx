import { describe, expect, it } from 'vitest';
import {
  buildReservedCatalogArticleMeta,
  resolveArticleMdxContentId,
} from '../../../utils/articleCanonicalPath';

describe('catalog-only reserved articles', () => {
  it('resolves reserved slug route param to learning_contents id for MDX load', () => {
    expect(resolveArticleMdxContentId('ppl-2-3-3-wind-shear-and-volcanic-ash')).toBe(
      'PPL-2-3-3_WindShearAndVolcanicAsh',
    );
  });

  it('builds article meta with canonical slug for Helmet/H1', () => {
    const meta = buildReservedCatalogArticleMeta('PPL-2-3-3_WindShearAndVolcanicAsh', {
      title: '【航空気象】ウィンドシアーと火山灰',
      description: '低高度 wind shear の要点',
      category: 'PPL',
    });
    expect(meta.slug).toBe('ppl-2-3-3-wind-shear-and-volcanic-ash');
    expect(meta.title).toContain('ウィンドシアー');
  });
});