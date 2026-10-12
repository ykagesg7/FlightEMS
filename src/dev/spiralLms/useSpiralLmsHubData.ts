import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useSpiralLms } from '../../hooks/useSpiralLms';
import { useAuthStore } from '../../stores/authStore';
import { buildArticlePublishedAtByContentId } from '../../utils/spiralLmsArticleRelease';
import { fetchSpiralContentSlugMap } from '../../utils/spiralLmsApi';
import { isSpiralLmsFeatureEnabled } from '../../utils/spiralLmsFeature';
import {
  buildSpiralLmsNodeDisplayContext,
  type SpiralLmsNodeDisplayContext,
} from '../../utils/spiralLmsNodeDisplay';
import type { SpiralLmsNode } from '../../types/spiralLms';
import type { SpiralLmsUserProgress } from '../../types/spiralLms';

const NOW_TICK_MS = 60_000;

export type SpiralLmsHubData = {
  featureEnabled: boolean;
  user: ReturnType<typeof useAuthStore.getState>['user'];
  now: Date;
  nodes: SpiralLmsNode[];
  progressByNodeId: Record<string, SpiralLmsUserProgress>;
  displayContext: SpiralLmsNodeDisplayContext;
  isLoading: boolean;
  isFetching: boolean;
  loadError: unknown;
  refetch: () => Promise<void>;
};

/** Recompute opens_at / article release gates once per minute. */
function useMinuteClock(): Date {
  const [now, setNow] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, NOW_TICK_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  return now;
}

export function useSpiralLmsHubData(): SpiralLmsHubData {
  const featureEnabled = isSpiralLmsFeatureEnabled();
  const user = useAuthStore((s) => s.user);
  const now = useMinuteClock();
  const spiral = useSpiralLms(now);

  const publishedAtByContentId = useMemo(() => buildArticlePublishedAtByContentId(), []);

  const slugMapQuery = useQuery({
    queryKey: ['spiralLms', 'slugMap'],
    queryFn: fetchSpiralContentSlugMap,
    enabled: featureEnabled && Boolean(user?.id),
    staleTime: 60_000,
  });

  const displayContext = useMemo(
    () =>
      buildSpiralLmsNodeDisplayContext(
        spiral.nodes,
        spiral.progressByNodeId,
        slugMapQuery.data ?? {},
        publishedAtByContentId,
        now,
      ),
    [now, publishedAtByContentId, slugMapQuery.data, spiral.nodes, spiral.progressByNodeId],
  );

  const loadError = spiral.error ?? slugMapQuery.error;
  const isLoading = Boolean(user) && (spiral.isLoading || slugMapQuery.isLoading);

  const refetch = async () => {
    await Promise.all([spiral.refetch(), slugMapQuery.refetch()]);
  };

  return {
    featureEnabled,
    user,
    now,
    nodes: spiral.nodes,
    progressByNodeId: spiral.progressByNodeId,
    displayContext,
    isLoading,
    isFetching: spiral.isFetching,
    loadError,
    refetch,
  };
}
