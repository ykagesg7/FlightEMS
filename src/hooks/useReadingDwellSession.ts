import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import {
  READING_HEARTBEAT_MS,
  READING_IDLE_MS,
  buildReadingLearningSessionInsert,
  capReadingDwellSeconds,
  shouldPersistReadingDwell,
  type ReadingContentType,
} from '../utils/readingLearningSession';

type Params = {
  userId: string | undefined;
  contentId: string;
  contentType: ReadingContentType;
  estimatedMinutes: number | null;
  enabled?: boolean;
};

/**
 * Accumulates visible, non-idle dwell on an article/lesson and upserts learning_sessions.
 */
export function useReadingDwellSession({
  userId,
  contentId,
  contentType,
  estimatedMinutes,
  enabled = true,
}: Params): void {
  const activeSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const lastActivityRef = useRef(Date.now());
  const sessionIdRef = useRef<string | null>(null);
  const flushingRef = useRef(false);
  const estimatedRef = useRef(estimatedMinutes);
  estimatedRef.current = estimatedMinutes;

  useEffect(() => {
    if (!enabled || !userId || !contentId) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const accumulate = () => {
      const now = Date.now();
      const last = lastTickRef.current;
      lastTickRef.current = now;
      if (last == null) return;
      const hidden = typeof document !== 'undefined' && document.visibilityState !== 'visible';
      const idle = now - lastActivityRef.current >= READING_IDLE_MS;
      if (hidden || idle) return;
      const delta = Math.max(0, Math.round((now - last) / 1000));
      activeSecondsRef.current = capReadingDwellSeconds(
        activeSecondsRef.current + delta,
        estimatedRef.current,
      );
    };

    const flush = async () => {
      accumulate();
      const seconds = activeSecondsRef.current;
      if (!shouldPersistReadingDwell(seconds) || flushingRef.current) return;
      flushingRef.current = true;
      try {
        const payload = buildReadingLearningSessionInsert({
          userId,
          contentId,
          contentType,
          dwellSeconds: seconds,
          estimatedMinutes: estimatedRef.current,
          endedAtIso: new Date().toISOString(),
        });
        if (sessionIdRef.current) {
          const { error } = await supabase
            .from('learning_sessions')
            .update({
              session_duration: payload.session_duration,
              ended_at: payload.ended_at,
              session_metadata: payload.session_metadata,
            })
            .eq('id', sessionIdRef.current)
            .eq('user_id', userId);
          if (error) console.warn('reading session update skipped:', error);
        } else {
          const { data, error } = await supabase
            .from('learning_sessions')
            .insert(payload)
            .select('id')
            .single();
          if (error) {
            console.warn('reading session insert skipped:', error);
            return;
          }
          sessionIdRef.current = data?.id ?? null;
        }
      } catch (e) {
        console.warn('reading session flush skipped:', e);
      } finally {
        flushingRef.current = false;
      }
    };

    const onVisibility = () => {
      accumulate();
      if (document.visibilityState === 'hidden') {
        void flush();
        lastTickRef.current = null;
      } else {
        lastTickRef.current = Date.now();
        markActivity();
      }
    };

    const onPageHide = () => {
      void flush();
    };

    lastTickRef.current = Date.now();
    markActivity();

    const heartbeat = window.setInterval(() => {
      void flush();
    }, READING_HEARTBEAT_MS);

    window.addEventListener('pointerdown', markActivity);
    window.addEventListener('keydown', markActivity);
    window.addEventListener('scroll', markActivity, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener('pointerdown', markActivity);
      window.removeEventListener('keydown', markActivity);
      window.removeEventListener('scroll', markActivity);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      void flush();
    };
  }, [userId, contentId, contentType, enabled]);
}
