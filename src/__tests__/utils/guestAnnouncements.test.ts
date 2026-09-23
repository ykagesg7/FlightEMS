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
});
