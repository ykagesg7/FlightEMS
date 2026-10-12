import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import type {
  SpiralLmsRecordAttemptInput,
  SpiralLmsRecordAttemptResponse,
} from '../types/spiralLms';
import { callRecordAttempt } from '../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../utils/spiralLmsFeature';
import {
  SpiralLmsRecordAttemptError,
  classifySpiralLmsRecordAttemptError,
  type SpiralLmsRecordAttemptErrorKind,
} from '../utils/spiralLmsRecordAttemptError';
import { assertValidSpiralLmsScore } from '../utils/spiralLmsScore';
import { useAuthStore } from '../stores/authStore';

const CONTENT_VIEW_PASSING_SCORE = 100;

function createClientAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error('crypto.randomUUID is not available');
}

function resolveRpcPayload(input: SpiralLmsRecordAttemptInput): {
  contentSlug: string | null;
  score: number;
} {
  if (input.attemptKind === 'content_view') {
    const slug = input.contentSlug.trim();
    if (!slug) {
      throw new SpiralLmsRecordAttemptError(
        'unknown',
        'content_slug_required',
      );
    }
    return { contentSlug: slug, score: CONTENT_VIEW_PASSING_SCORE };
  }

  assertValidSpiralLmsScore(input.score);
  return { contentSlug: null, score: input.score };
}

/**
 * Calls `record_attempt` with a stable `client_attempt_id` for retries on the same logical attempt.
 */
export function useRecordSpiralAttempt() {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const clientAttemptIdRef = useRef<string | null>(null);
  const lastInputRef = useRef<SpiralLmsRecordAttemptInput | null>(null);

  const resetClientAttemptId = useCallback(() => {
    clientAttemptIdRef.current = null;
  }, []);

  const mutation = useMutation({
    mutationFn: async (
      input: SpiralLmsRecordAttemptInput,
    ): Promise<SpiralLmsRecordAttemptResponse> => {
      lastInputRef.current = input;
      if (!featureEnabled) {
        throw new SpiralLmsRecordAttemptError('unknown', 'spiral_lms_disabled');
      }
      if (!user?.id) {
        throw new SpiralLmsRecordAttemptError('not_authenticated', 'not_authenticated');
      }

      const { contentSlug, score } = resolveRpcPayload(input);

      if (!clientAttemptIdRef.current) {
        clientAttemptIdRef.current = createClientAttemptId();
      }

      try {
        return await callRecordAttempt({
          nodeId: input.nodeId,
          attemptKind: input.attemptKind,
          clientAttemptId: clientAttemptIdRef.current,
          contentSlug,
          score,
        });
      } catch (error) {
        throw classifySpiralLmsRecordAttemptError(error);
      }
    },
    onSuccess: () => {
      clientAttemptIdRef.current = null;
      void queryClient.invalidateQueries({ queryKey: ['spiralLms'] });
    },
  });

  const recordAttempt = useCallback(
    (input: SpiralLmsRecordAttemptInput, options?: { retry?: boolean }) => {
      if (!options?.retry) {
        clientAttemptIdRef.current = null;
      }
      return mutation.mutate(input);
    },
    [mutation],
  );

  const recordAttemptAsync = useCallback(
    async (input: SpiralLmsRecordAttemptInput, options?: { retry?: boolean }) => {
      if (!options?.retry) {
        clientAttemptIdRef.current = null;
      }
      return mutation.mutateAsync(input);
    },
    [mutation],
  );

  const retryRecordAttempt = useCallback(() => {
    const input = lastInputRef.current;
    if (!input) {
      return;
    }
    recordAttempt(input, { retry: true });
  }, [recordAttempt]);

  const recordAttemptError = mutation.error;
  const recordAttemptErrorKind: SpiralLmsRecordAttemptErrorKind | null = useMemo(() => {
    if (!recordAttemptError) {
      return null;
    }
    return classifySpiralLmsRecordAttemptError(recordAttemptError).kind;
  }, [recordAttemptError]);

  const recordAttemptErrorInfo = useMemo(() => {
    if (!recordAttemptError) {
      return null;
    }
    const classified = classifySpiralLmsRecordAttemptError(recordAttemptError);
    return { kind: classified.kind, message: classified.message };
  }, [recordAttemptError]);

  return {
    ...mutation,
    isFeatureEnabled: featureEnabled,
    isReady: featureEnabled && Boolean(user?.id),
    clientAttemptId: clientAttemptIdRef.current,
    resetClientAttemptId,
    recordAttempt,
    recordAttemptAsync,
    retryRecordAttempt,
    recordAttemptErrorKind,
    recordAttemptErrorInfo,
  };
}
