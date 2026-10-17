import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  compareLearningContentsMeta,
  normalizeRowPayload,
  parseMetaUpdateSql,
} from '../../../scripts/database/verify_learning_contents_meta.mjs';

const CP_2_2_META_SQL = join(
  process.cwd(),
  'scripts/database/20261017_learning_contents_cp_2_2_accelerated_stall_meta.sql',
);

describe('verify_learning_contents_meta', () => {
  it('parses CP-2-2 meta UPDATE SQL (description only)', () => {
    const sql = readFileSync(CP_2_2_META_SQL, 'utf-8');
    const expected = parseMetaUpdateSql(sql);
    expect(expected.id).toBe('CP-2-2_AcceleratedStall');
    expect(expected.title).toBeUndefined();
    expect(expected.description).toContain('低速域と高速域の2本');
    expect(expected.description).toContain('オーバーGはするな。学習記事であり実機手順ではない。');
  });

  it('PASS when actual row matches expected fields', () => {
    const sql = readFileSync(CP_2_2_META_SQL, 'utf-8');
    const expected = parseMetaUpdateSql(sql);
    const row = normalizeRowPayload({
      id: expected.id,
      title: '【操縦】第5話：もっと引くな ～加速失速～',
      description: expected.description,
      updated_at: '2026-10-17T00:00:00+00:00',
    });
    const result = compareLearningContentsMeta(expected, row);
    expect(result.pass).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('FAIL with field diff when description differs', () => {
    const sql = readFileSync(CP_2_2_META_SQL, 'utf-8');
    const expected = parseMetaUpdateSql(sql);
    const row = normalizeRowPayload({
      id: expected.id,
      title: '【操縦】第5話：もっと引くな ～加速失速～',
      description: 'stale text',
    });
    const result = compareLearningContentsMeta(expected, row);
    expect(result.pass).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]?.field).toBe('description');
  });

  it('parses title and description from CP-2-1 style SQL', () => {
    const sql = readFileSync(
      join(process.cwd(), 'scripts/database/20261016_learning_contents_cp_2_1_post_stall_meta.sql'),
      'utf-8',
    );
    const expected = parseMetaUpdateSql(sql);
    expect(expected.id).toBe('CP-2-1_DeepStall');
    expect(expected.title).toContain('ポストストール');
    expect(expected.description).toContain('ハンズオフ');
  });
});
