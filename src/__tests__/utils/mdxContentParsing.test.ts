import { describe, it, expect } from 'vitest';
import {
  extractTitleFromMDX,
  extractDescriptionFromMDX,
  guessCategoryFromFilename,
  guessOrderIndexFromFilename,
  MDX_CATEGORY_MAPPING,
} from '../../utils/mdxContentParsing';

describe('mdxContentParsing', () => {
  it('extractTitleFromMDX reads markdown h1 or HTML h1', () => {
    expect(extractTitleFromMDX('# Hello\n\nbody')).toBe('Hello');
    expect(extractTitleFromMDX('<h1>HTML Title</h1>')).toBe('HTML Title');
    expect(extractTitleFromMDX('no title')).toBeNull();
  });

  it('extractDescriptionFromMDX takes paragraph after heading block', () => {
    const body = '# T\n\n### Sub\n\nignored';
    expect(extractDescriptionFromMDX(body)).toBe('Sub');
    const html = '<h1>T</h1>\n\nFirst para with <b>html</b>.\n\nmore';
    expect(extractDescriptionFromMDX(html)).toBe('First para with html.');
  });

  it('guessCategoryFromFilename uses numeric prefix mapping', () => {
    expect(guessCategoryFromFilename('3_Foo')).toBe(MDX_CATEGORY_MAPPING['3']);
    expect(guessCategoryFromFilename('0.2_intro')).toBe('メンタリティー');
    expect(guessCategoryFromFilename('no_prefix')).toBe('一般');
  });

  it('guessOrderIndexFromFilename returns first numeric segment', () => {
    expect(guessOrderIndexFromFilename('3.5.1_Foo')).toBe(3);
    expect(guessOrderIndexFromFilename('foo-12-bar')).toBe(12);
    expect(guessOrderIndexFromFilename('abc')).toBe(0);
  });
});
