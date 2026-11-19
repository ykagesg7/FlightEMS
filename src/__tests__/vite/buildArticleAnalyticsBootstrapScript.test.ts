import { describe, expect, it } from 'vitest';
import {
  buildArticleAnalyticsBootstrapInlineScript,
  buildArticleAnalyticsBootstrapMap,
  buildGtagInitInlineScript,
} from '../../../vite/buildArticleAnalyticsBootstrapScript';

describe('buildArticleAnalyticsBootstrapScript', () => {
  it('maps /learning content ids to canonical article paths', () => {
    const map = buildArticleAnalyticsBootstrapMap();
    expect(map.learning['IF-1-3_IMC_Scan']).toBe('/articles/if-1-3-imc-scan');
    expect(map.learning['CPL-Hub-Navigation']).toBe('/articles/cpl-hub-navigation');
  });

  it('includes legacy article path redirects for inline bootstrap', () => {
    const map = buildArticleAnalyticsBootstrapMap();
    expect(map.pathMap['/articles/IF-1-3_IMC_Scan']).toBe('/articles/if-1-3-imc-scan');
  });

  it('generates gtag init that reads __FA_GA_CANONICAL_PATH__ before config', () => {
    const init = buildGtagInitInlineScript('G-TEST123');
    expect(init).toContain('__FA_GA_CANONICAL_PATH__');
    expect(init).toContain("gtag('config','G-TEST123'");
    expect(init).toContain('send_page_view:false');
    expect(init).toContain('page_location');
  });

  it('inline bootstrap replaces /learning paths before gtag config', () => {
    const script = buildArticleAnalyticsBootstrapInlineScript(buildArticleAnalyticsBootstrapMap());
    expect(script).toMatch(/\\\/learning\\\//);
    expect(script).toContain('replaceState');
    expect(script).toContain('__FA_GA_CANONICAL_PATH__');
  });
});