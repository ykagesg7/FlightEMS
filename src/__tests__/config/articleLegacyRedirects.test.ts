import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  assertArticleLegacyRedirectsValid,
  buildArticleLegacyRedirects,
  type ArticleLegacyRedirect,
} from '../../../scripts/lib/articleLegacyRedirects';

const configPath = resolve(process.cwd(), 'config/article-legacy-redirects.json');
const vercelPath = resolve(process.cwd(), 'vercel.json');

function readCommittedRedirects(): ArticleLegacyRedirect[] {
  return JSON.parse(readFileSync(configPath, 'utf8')) as ArticleLegacyRedirect[];
}

describe('article legacy redirects', () => {
  it('maps every MDX basename to canonical slug without chains', () => {
    const generated = buildArticleLegacyRedirects();
    assertArticleLegacyRedirectsValid(generated);
    expect(generated.length).toBeGreaterThan(100);
  });

  it('keeps committed config in sync with MDX and vercel.json', () => {
    const generated = buildArticleLegacyRedirects();
    const committed = readCommittedRedirects();
    expect(committed).toEqual(generated);

    const vercel = JSON.parse(readFileSync(vercelPath, 'utf8')) as {
      redirects?: ArticleLegacyRedirect[];
    };
    expect(vercel.redirects).toEqual(generated);
  });

  it('covers sample legacy filenames used in production links', () => {
    const committed = readCommittedRedirects();
    const bySource = new Map(committed.map((r) => [r.source, r.destination]));

    expect(bySource.get('/articles/3.3.10_CloudTypes')).toBe('/articles/3-3-10-cloud-types');
    expect(bySource.get('/articles/3.3.12_Turbulence')).toBe('/articles/3-3-12-turbulence');
    expect(bySource.get('/articles/CP-5-5_Loop')).toBe('/articles/cp-5-5-loop');
    expect(bySource.get('/articles/PPL-4-2-2_ClearanceReadbackBasics')).toBe(
      '/articles/ppl-4-2-2-clearance-readback-basics',
    );
    expect(bySource.get('/articles/IF-1-3_IMC_Scan')).toBe('/articles/if-1-3-imc-scan');
    expect(bySource.get('/articles/IF-1-4_Attitude_Turns')).toBe(
      '/articles/if-1-4-attitude-turns',
    );

    const sources = new Set(committed.map((r) => r.source));
    expect(sources.has('/articles/if-1-3-imc-scan')).toBe(false);
    expect(sources.has('/articles/3-3-10-cloud-types')).toBe(false);
  });
});
