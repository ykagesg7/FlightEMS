import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = join(import.meta.dirname, '../../..');

describe('sitemap API serverless bundle policy', () => {
  it('keeps sitemapCore imports inside api/_lib (no src/ cross-root imports)', () => {
    const source = readFileSync(join(repoRoot, 'api/_lib/sitemapCore.ts'), 'utf8');
    expect(source).not.toMatch(/from ['"][^'"]*\/src\//);
    expect(source).toContain("from './withdrawnArticleIds'");
  });
});

describe('api/sitemap.xml handler', () => {
  it('responds 200 with XML on GET', async () => {
    process.env.VITE_APP_URL = 'https://flight-lms.vercel.app';
    const handler = (await import('../../../api/sitemap.xml')).default;

    const headers: Record<string, string> = {};
    let statusCode = 0;
    let body = '';

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      setHeader(name: string, value: string) {
        headers[name.toLowerCase()] = value;
      },
      end(payload?: string) {
        if (payload !== undefined) body = payload;
      },
      send(payload: string) {
        body = payload;
      },
    };

    handler({ method: 'GET', headers: {} } as never, res as never);

    expect(statusCode).toBe(200);
    expect(headers['content-type']).toContain('application/xml');
    expect(body).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(body).not.toContain('/articles/right-people-on-board');
  });

  it('returns 405 for POST', async () => {
    const handler = (await import('../../../api/sitemap.xml')).default;
    let statusCode = 0;
    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      setHeader() {
        return this;
      },
      end() {},
    };
    handler({ method: 'POST', headers: {} } as never, res as never);
    expect(statusCode).toBe(405);
  });
});
