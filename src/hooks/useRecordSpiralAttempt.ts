import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import type {
  SpiralLmsRecordAttemptInput,
  SpiralLmsRecordAttemptResponse,
} from '../types/spiralLms';
import { callRecordAttempt } from '../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../utils/spiralLmsFeature';
import { useAuthStore } from '../stores/authStore';
function createClientAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error('crypto.randomUUID is not available');
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
        throw new Error('spiral_lms_disabled');
      }
      if (!user?.id) {
        throw new Error('not_authenticated');
      }

      if (!clientAttemptIdRef.current) {
        clientAttemptIdRef.current = createClientAttemptId();
      }

      return callRecordAttempt({
        nodeId: input.nodeId,
        attemptKind: input.attemptKind,
        clientAttemptId: clientAttemptIdRef.current,
        contentSlug: input.contentSlug,
        score: input.score,
      });
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

  return {
    ...mutation,
    isFeatureEnabled: featureEnabled,
    isReady: featureEnabled && Boolean(user?.id),
    clientAttemptId: clientAttemptIdRef.current,
    resetClientAttemptId,
    recordAttempt,
    recordAttemptAsync,
    retryRecordAttempt,
  };
}
