import { describe, it, expect } from 'vitest';
import {
  buildNotamCardView,
  buildNotamPeekSummary,
  formatNotamPeriodJst,
  isIcaoLocationCode,
  resolveNotamSearchKind,
} from '../../pages/planning/components/map/notamDisplayUtils';
import type { SwimNotamItem } from '../../services/swimNotam';

describe('notamDisplayUtils', () => {
  it('formatNotamPeriodJst renders JST range', () => {
    const p = formatNotamPeriodJst('2026-06-08T05:00:00Z', '2026-06-09T21:00:00Z');
    expect(p.label).toContain('2026');
    expect(p.label).toContain('〜');
    expect(p.titleAttr).toContain('2026-06-08');
  });

  it('buildNotamPeekSummary includes counts', () => {
    expect(buildNotamPeekSummary('RJFF', 2, 1)).toBe('RJFF — NOTAM 現在2件・将来1件');
    expect(buildNotamPeekSummary('VOR', 0, 0, true)).toContain('該当なし');
    expect(buildNotamPeekSummary('VOR', 1, 0, true)).toContain('キーワード');
  });

  it('buildNotamCardView prefers impactLabel and primaryText', () => {
    const item: SwimNotamItem = {
      key: 'k1',
      summary: 'fallback summary',
      impactLabel: 'RJFF 滑走路16L 閉鎖',
      primaryText: '滑走路16Lは閉鎖されています。',
      category: 'runway',
      begin: '2026-06-08T05:00:00Z',
    };
    const card = buildNotamCardView(item);
    expect(card.cardTitle).toBe('RJFF 滑走路16L 閉鎖');
    expect(card.bodyText).toContain('16L');
    expect(card.categoryLabel).toBe('滑走路');
  });

  it('resolveNotamSearchKind uses ICAO pattern', () => {
    expect(isIcaoLocationCode('RJFF')).toBe(true);
    expect(isIcaoLocationCode('SAMBO')).toBe(false);
    expect(resolveNotamSearchKind('RJTT')).toBe('location');
    expect(resolveNotamSearchKind('SAMBO')).toBe('keyword');
  });
});
