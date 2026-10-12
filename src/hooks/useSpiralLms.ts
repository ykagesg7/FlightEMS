import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SpiralLmsNode, SpiralLmsUserProgress } from '../types/spiralLms';
import { fetchSpiralLmsNodes, fetchSpiralLmsUserProgress } from '../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../utils/spiralLmsFeature';
import { useAuthStore } from '../stores/authStore';

const STALE_TIME_MS = 30_000;

export const spiralLmsQueryKeys = {
  nodes: ['spiralLms', 'nodes'] as const,
  progress: (userId: string) => ['spiralLms', 'progress', userId] as const,
};

/**
 * Published spiral LMS nodes and the signed-in user's progress (no-op when feature flag is off).
 */
export function useSpiralLms(now: Date = new Date()) {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const user = useAuthStore((s) => s.user);

  const nodesQuery = useQuery({
    queryKey: spiralLmsQueryKeys.nodes,
    queryFn: () => fetchSpiralLmsNodes(now),
    enabled: featureEnabled,
    staleTime: STALE_TIME_MS,
  });

  const opensAtByNodeId = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const node of nodesQuery.data ?? []) {
      map[node.id] = node.opens_at;
    }
    return map;
  }, [nodesQuery.data]);

  const progressQuery = useQuery({
    queryKey: spiralLmsQueryKeys.progress(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) {
        return {} as Record<string, SpiralLmsUserProgress>;
      }
      return fetchSpiralLmsUserProgress(user.id, opensAtByNodeId, now);
    },
    enabled: featureEnabled && Boolean(user?.id) && nodesQuery.isSuccess,
    staleTime: STALE_TIME_MS,
  });

  const nodes: SpiralLmsNode[] = featureEnabled ? (nodesQuery.data ?? []) : [];
  const progressByNodeId: Record<string, SpiralLmsUserProgress> =
    featureEnabled && user?.id ? (progressQuery.data ?? {}) : {};

  return {
    isFeatureEnabled: featureEnabled,
    nodes,
    progressByNodeId,
    isLoading: featureEnabled && (nodesQuery.isLoading || (Boolean(user?.id) && progressQuery.isLoading)),
    isFetching: featureEnabled && (nodesQuery.isFetching || progressQuery.isFetching),
    error: (nodesQuery.error ?? progressQuery.error) as Error | null,
    refetch: async () => {
      await nodesQuery.refetch();
      if (user?.id) {
        await progressQuery.refetch();
      }
    },
  };
}
