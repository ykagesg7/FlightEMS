import { describe, expect, it } from 'vitest';
import {
  canonicalizeAnalyticsPagePath,
  resolveInAppArticleRedirectPath,
} from '../../utils/articleRouteResolve';

describe('articleRouteResolve', () => {
  it('maps legacy filename segments to canonical paths for GA4', () => {
    expect(canonicalizeAnalyticsPagePath('/articles/IF-1-3_IMC_Scan')).toBe(
      '/articles/if-1-3-imc-scan',
    );
    expect(canonicalizeAnalyticsPagePath('/articles/3.3.10_CloudTypes')).toBe(
      '/articles/3-3-10-cloud-types',
    );
    expect(canonicalizeAnalyticsPagePath('/articles/CPL-Hub-Navigation')).toBe(
      '/articles/cpl-hub-navigation',
    );
  });

  it('preserves query strings when canonicalizing', () => {
    expect(canonicalizeAnalyticsPagePath('/articles/IF-1-3_IMC_Scan?utm=1')).toBe(
      '/articles/if-1-3-imc-scan?utm=1',
    );
  });

  it('leaves canonical paths unchanged', () => {
    expect(canonicalizeAnalyticsPagePath('/articles/if-1-3-imc-scan')).toBe(
      '/articles/if-1-3-imc-scan',
    );
    expect(canonicalizeAnalyticsPagePath('/articles')).toBe('/articles');
  });

  it('returns redirect target for in-app legacy params', () => {
    expect(resolveInAppArticleRedirectPath('IF-1-3_IMC_Scan')).toBe('/articles/if-1-3-imc-scan');
    expect(resolveInAppArticleRedirectPath('if-1-3-imc-scan')).toBeNull();
  });

  it('does not collapse distinct PPL and CPL cloud articles', () => {
    expect(resolveInAppArticleRedirectPath('ppl-2-1-6-cloud-types-and-formation')).toBeNull();
    expect(resolveInAppArticleRedirectPath('3-3-10-cloud-types')).toBeNull();
    expect(canonicalizeAnalyticsPagePath('/articles/ppl-2-1-6-cloud-types-and-formation')).toBe(
      '/articles/ppl-2-1-6-cloud-types-and-formation',
    );
  });
});