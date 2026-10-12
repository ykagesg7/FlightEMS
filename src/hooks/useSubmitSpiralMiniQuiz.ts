import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import type {
  SpiralMiniQuizAnswerPayload,
  SpiralMiniQuizSubmitResponse,
} from '../types/spiralLmsMiniQuiz';
import { callSubmitMiniQuiz, fetchNodeMiniQuizQuestions } from '../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../utils/spiralLmsFeature';
import {
  SpiralLmsRecordAttemptError,
  classifySpiralLmsRecordAttemptError,
  type SpiralLmsRecordAttemptErrorKind,
} from '../utils/spiralLmsRecordAttemptError';
import { useAuthStore } from '../stores/authStore';

function createClientAttemptId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  throw new Error('crypto.randomUUID is not available');
}

export const spiralMiniQuizQueryKeys = {
  questions: (nodeId: string) => ['spiralLms', 'miniQuiz', nodeId] as const,
};

export function useNodeMiniQuizQuestions(nodeId: string) {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const trimmedNodeId = nodeId.trim();

  return useQuery({
    queryKey: spiralMiniQuizQueryKeys.questions(trimmedNodeId),
    queryFn: () => fetchNodeMiniQuizQuestions(trimmedNodeId),
    enabled: featureEnabled && trimmedNodeId.length > 0,
  });
}

export function useSubmitSpiralMiniQuiz(nodeId: string) {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const clientAttemptIdRef = useRef<string | null>(null);
  const trimmedNodeId = nodeId.trim();

  const resetClientAttemptId = useCallback(() => {
    clientAttemptIdRef.current = null;
  }, []);

  const mutation = useMutation({
    mutationFn: async (
      answers: SpiralMiniQuizAnswerPayload[],
    ): Promise<SpiralMiniQuizSubmitResponse> => {
      if (!featureEnabled) {
        throw new SpiralLmsRecordAttemptError('unknown', 'spiral_lms_disabled');
      }
      if (!user?.id) {
        throw new SpiralLmsRecordAttemptError('not_authenticated', 'not_authenticated');
      }
      if (!trimmedNodeId) {
        throw new SpiralLmsRecordAttemptError('unknown', 'node_id_required');
      }

      if (!clientAttemptIdRef.current) {
        clientAttemptIdRef.current = createClientAttemptId();
      }

      try {
        return await callSubmitMiniQuiz({
          nodeId: trimmedNodeId,
          clientAttemptId: clientAttemptIdRef.current,
          answers,
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

  const submitMiniQuiz = useCallback(
    (answers: SpiralMiniQuizAnswerPayload[], options?: { retry?: boolean }) => {
      if (!options?.retry) {
        clientAttemptIdRef.current = null;
      }
      return mutation.mutate(answers);
    },
    [mutation],
  );

  const submitMiniQuizAsync = useCallback(
    async (answers: SpiralMiniQuizAnswerPayload[], options?: { retry?: boolean }) => {
      if (!options?.retry) {
        clientAttemptIdRef.current = null;
      }
      return mutation.mutateAsync(answers);
    },
    [mutation],
  );

  const submitErrorKind: SpiralLmsRecordAttemptErrorKind | null = useMemo(() => {
    if (!mutation.error) {
      return null;
    }
    return classifySpiralLmsRecordAttemptError(mutation.error).kind;
  }, [mutation.error]);

  return {
    ...mutation,
    isFeatureEnabled: featureEnabled,
    isReady: featureEnabled && Boolean(user?.id) && trimmedNodeId.length > 0,
    resetClientAttemptId,
    submitMiniQuiz,
    submitMiniQuizAsync,
    submitErrorKind,
  };
}
