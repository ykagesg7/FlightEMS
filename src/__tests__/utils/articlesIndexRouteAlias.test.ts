import { describe, expect, it } from 'vitest';
import { articleFilenamePrefix } from '../../utils/articlesIndex';

describe('articleFilenamePrefix', () => {
  it('returns the segment before underscore', () => {
    expect(articleFilenamePrefix('FMT-1-5_ShortIdExample')).toBe('FMT-1-5');
  });

  it('is case-sensitive on the filename but matching is case-insensitive in route resolver', () => {
    expect(articleFilenamePrefix('fmt-1-5_title')).toBe('fmt-1-5');
  });
});
