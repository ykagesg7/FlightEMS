import { describe, expect, it } from 'vitest';
import { isChunkLoadFailure } from '../../utils/chunkLoadRecovery';

describe('chunkLoadRecovery', () => {
  it('detects dynamic import failures', () => {
    expect(
      isChunkLoadFailure(new Error('Failed to fetch dynamically imported module: /assets/ArticleDetailPage-abc.js')),
    ).toBe(true);
    expect(isChunkLoadFailure(new Error('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadFailure(new Error('Something else'))).toBe(false);
  });
});
