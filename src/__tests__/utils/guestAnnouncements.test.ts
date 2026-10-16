import { describe, expect, it } from 'vitest';
import { filterGuestAnnouncements, isDevAnnouncement } from '../../utils/guestAnnouncements';

describe('guestAnnouncements', () => {
  it('detects development log titles', () => {
    expect(isDevAnnouncement('Phase 7 アンロック')).toBe(true);
    expect(isDevAnnouncement('HomePage 改修')).toBe(true);
    expect(isDevAnnouncement('新記事: 航空気象入門')).toBe(false);
  });

  it('filters dev announcements for guest home', () => {
    const announcements = [
      { id: 1, title: 'Phase 7 アンロック', date: '2026-01-01' },
      { id: 2, title: 'PPL 航空気象の新記事を公開', date: '2026-01-02' },
    ];
    const filtered = filterGuestAnnouncements(announcements);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.title).toContain('航空気象');
  });

  it('keeps only learner-facing rows from current production top-5 titles', () => {
    const announcements = [
      { id: 6, title: 'HomePageにお知らせセクションを追加', date: '2025-11-02T13:31:22.804555+00:00' },
      { id: 2, title: 'Phase 7: シリーズ順次アンロック機能を実装', date: '2025-11-02T00:00:00+00:00' },
      { id: 5, title: 'フライトプランニング機能にMETAR/TAF統合', date: '2025-10-26T13:31:15.183576+00:00' },
      { id: 3, title: 'Phase 5: 記事読書体験向上システムを実装', date: '2025-09-15T00:00:00+00:00' },
      { id: 4, title: 'Phase 6: Lessonページ検索・タグ機能統合を完了', date: '2025-08-17T00:00:00+00:00' },
    ];
    const filtered = filterGuestAnnouncements(announcements);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(5);
  });
});
