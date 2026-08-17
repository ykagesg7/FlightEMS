import { describe, expect, it } from 'vitest';
import {
  READING_MAX_SESSION_SECONDS,
  READING_MIN_SAVE_SECONDS,
  buildReadingLearningSessionInsert,
  capReadingDwellSeconds,
  shouldPersistReadingDwell,
} from '../../utils/readingLearningSession';

describe('readingLearningSession', () => {
  it('does not persist dwell under 30 seconds', () => {
    expect(shouldPersistReadingDwell(29)).toBe(false);
    expect(shouldPersistReadingDwell(READING_MIN_SAVE_SECONDS)).toBe(true);
  });

  it('caps a visit at 45 minutes or 3x estimate, whichever is smaller', () => {
    expect(capReadingDwellSeconds(10_000, null)).toBe(READING_MAX_SESSION_SECONDS);
    expect(capReadingDwellSeconds(10_000, 5)).toBe(15 * 60);
  });

  it('builds a reading session payload', () => {
    const payload = buildReadingLearningSessionInsert({
      userId: 'user-1',
      contentId: 'CP-2-1_DeepStall',
      contentType: 'lesson',
      dwellSeconds: 90,
      estimatedMinutes: 8,
      endedAtIso: '2026-08-17T00:00:00.000Z',
    });
    expect(payload.session_type).toBe('reading');
    expect(payload.content_type).toBe('lesson');
    expect(payload.session_duration).toBe(90);
    expect(payload.session_metadata.source).toBe('reading_dwell');
  });
});
