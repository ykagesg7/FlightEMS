import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { SPA_HUB_FALLBACK_PATHS, writeSpaHubFallbacks } from '../../../vite/prerenderArticlesPlugin';

describe('writeSpaHubFallbacks', () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes SPA hub index.html without clobbering an existing file', () => {
    const distDir = mkdtempSync(join(tmpdir(), 'spa-hub-'));
    dirs.push(distDir);
    const template = '<!doctype html><title>shell</title>';
    writeFileSync(join(distDir, 'index.html'), template);

    const first = writeSpaHubFallbacks(distDir, template);
    expect(first).toBe(SPA_HUB_FALLBACK_PATHS.length);
    expect(readFileSync(join(distDir, 'articles', 'index.html'), 'utf8')).toBe(template);

    writeFileSync(join(distDir, 'articles', 'index.html'), '<html>keep</html>');
    const second = writeSpaHubFallbacks(distDir, template);
    expect(second).toBe(0);
    expect(readFileSync(join(distDir, 'articles', 'index.html'), 'utf8')).toBe('<html>keep</html>');
  });
});
