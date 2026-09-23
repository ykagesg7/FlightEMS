import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  deleteDistSourcemapFiles,
  listDistSourcemapFiles,
} from './deleteDistSourcemapsPlugin';

describe('deleteDistSourcemapsPlugin helpers', () => {
  let tempDir: string;

  afterEach(async () => {
    if (tempDir) {
      await deleteDistSourcemapFiles(tempDir).catch(() => undefined);
    }
  });

  it('lists and deletes only .map files under the output directory', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'dist-sourcemaps-'));
    await mkdir(join(tempDir, 'assets'), { recursive: true });
    await mkdir(join(tempDir, 'nested'), { recursive: true });
    await writeFile(join(tempDir, 'assets', 'index.js'), 'console.log("ok");');
    await writeFile(join(tempDir, 'assets', 'index.js.map'), '{}');
    await writeFile(join(tempDir, 'nested', 'chunk.js.map'), '{}');

    const before = await listDistSourcemapFiles(tempDir);
    expect(before).toHaveLength(2);

    const removed = await deleteDistSourcemapFiles(tempDir);
    expect(removed).toBe(2);
    expect(await listDistSourcemapFiles(tempDir)).toHaveLength(0);
  });
});
