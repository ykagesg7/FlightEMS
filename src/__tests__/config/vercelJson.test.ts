import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type VercelRewrite = {
  source: string;
  destination: string;
};

type VercelConfig = {
  routes?: unknown;
  rewrites?: VercelRewrite[];
  cleanUrls?: boolean;
  ignoreCommand?: string;
  crons?: unknown;
};

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'),
) as VercelConfig;

describe('vercel.json SPA fallback', () => {
  it('uses rewrites instead of legacy routes so cleanUrls/headers still apply', () => {
    expect(config.routes).toBeUndefined();
    expect(config.cleanUrls).toBe(true);
    expect(Array.isArray(config.rewrites)).toBe(true);
  });

  it('rewrites unknown client paths to / so cleanUrls can serve the SPA shell', () => {
    const rewrites = config.rewrites ?? [];
    const spa = rewrites.filter((rule) => rule.destination === '/');
    expect(spa).toHaveLength(1);
    expect(spa[0]?.source).toBe('/(.*)');
    expect(spa[0]?.source).not.toContain('?!api/');

    const destinations = rewrites.map((rule) => rule.destination);
    expect(destinations).toContain('/api/mfa-recovery-codes?action=:action');
    expect(destinations).toContain('/api/weather?action=aviation');
    expect(destinations).toContain('/api/weather?action=rainviewer');
    expect(destinations).toContain('/api/cron?job=:job');

    const spaIndex = rewrites.findIndex((rule) => rule.destination === '/');
    const aviationIndex = rewrites.findIndex((rule) => rule.source === '/api/aviation-weather');
    expect(aviationIndex).toBeGreaterThanOrEqual(0);
    expect(aviationIndex).toBeLessThan(spaIndex);
  });

  it('skips docs-only git deploys without changing SPA fallback or crons', () => {
    expect(config.ignoreCommand).toBe('node scripts/vercel-ignore-build.mjs');
    expect(Array.isArray(config.crons)).toBe(true);
  });
});
