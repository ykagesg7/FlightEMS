import { describe, expect, it } from 'vitest';
import { parseQuizQuestionText } from '../../pages/test/utils/formatQuizQuestionText';

describe('parseQuizQuestionText', () => {
  it('splits CPL combo-count stem and (a)-(d) choices', () => {
    const text =
      '対流圏における逆転層の成因と特徴について (a) 〜 (d) のうち、正しいものはいくつあるか。(a) 第一の説明。(b) 第二の説明。(c) 第三の説明。';
    const parsed = parseQuizQuestionText(text);
    expect(parsed.kind).toBe('structured');
    if (parsed.kind !== 'structured') return;
    expect(parsed.stem).toContain('いくつあるか');
    expect(parsed.choices).toHaveLength(3);
    expect(parsed.choices[0].label).toBe('a');
    expect(parsed.choices[1].label).toBe('b');
  });

  it('falls back to plain text with sentence breaks', () => {
    const parsed = parseQuizQuestionText('単一の設問文です。続きの文。');
    expect(parsed.kind).toBe('plain');
    if (parsed.kind !== 'plain') return;
    expect(parsed.text).toContain('。\n\n');
  });

  it('splits katakana (ア)-(エ) combo-count stem and choices', () => {
    const text =
      '航空法施行規則第97条に規定された施設の種類（ア）〜（エ）のうち、正しいものはいくつあるか。（ア）VOR（イ）DME（ウ）タカン（エ）衛星航法補助施設';
    const parsed = parseQuizQuestionText(text);
    expect(parsed.kind).toBe('structured');
    if (parsed.kind !== 'structured') return;
    expect(parsed.stem).toContain('いくつあるか');
    expect(parsed.choices).toHaveLength(4);
    expect(parsed.choices[0].label).toBe('ア');
    expect(parsed.choices[0].body).toBe('VOR');
    expect(parsed.choices[3].label).toBe('エ');
  });

  it('keeps (ア)〜(エ) range-only reference as plain text', () => {
    const text = '次の（ア）〜（エ）の記述のうち誤りはどれか。';
    const parsed = parseQuizQuestionText(text);
    expect(parsed.kind).toBe('plain');
  });
});
