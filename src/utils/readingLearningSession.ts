export const READING_MIN_SAVE_SECONDS = 30;
export const READING_IDLE_MS = 60_000;
export const READING_HEARTBEAT_MS = 30_000;
export const READING_MAX_SESSION_SECONDS = 45 * 60;

export type ReadingContentType = 'article' | 'lesson';

export type ReadingLearningSessionInsert = {
  user_id: string;
  content_id: string;
  content_type: ReadingContentType;
  session_type: 'reading';
  session_duration: number;
  ended_at: string;
  session_metadata: {
    source: 'reading_dwell';
    wall_clock_seconds: number;
    estimated_minutes: number | null;
  };
};

export function capReadingDwellSeconds(
  rawSeconds: number,
  estimatedMinutes: number | null,
): number {
  const estimateCap =
    estimatedMinutes != null && estimatedMinutes > 0
      ? estimatedMinutes * 3 * 60
      : READING_MAX_SESSION_SECONDS;
  const cap = Math.min(READING_MAX_SESSION_SECONDS, estimateCap);
  return Math.max(0, Math.min(rawSeconds, cap));
}

export function shouldPersistReadingDwell(seconds: number): boolean {
  return seconds >= READING_MIN_SAVE_SECONDS;
}

export function buildReadingLearningSessionInsert(params: {
  userId: string;
  contentId: string;
  contentType: ReadingContentType;
  dwellSeconds: number;
  estimatedMinutes: number | null;
  endedAtIso: string;
}): ReadingLearningSessionInsert {
  const capped = capReadingDwellSeconds(params.dwellSeconds, params.estimatedMinutes);
  return {
    user_id: params.userId,
    content_id: params.contentId,
    content_type: params.contentType,
    session_type: 'reading',
    session_duration: capped,
    ended_at: params.endedAtIso,
    session_metadata: {
      source: 'reading_dwell',
      wall_clock_seconds: capped,
      estimated_minutes: params.estimatedMinutes,
    },
  };
}
