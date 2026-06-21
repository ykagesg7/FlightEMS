import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import type { CohortAnonymousStats, UserCohortProfile } from '../utils/cohort';
import {
  fetchCohortAnonymousStats,
  fetchUserCohortProfile,
} from '../utils/cohortApi';

export function useCohortProfile() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['cohort', 'profile', user?.id],
    queryFn: async () => {
      const { profile, error } = await fetchUserCohortProfile();
      if (error) throw error;
      return profile;
    },
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const cohortKey = profileQuery.data?.cohort_key ?? null;

  const statsQuery = useQuery({
    queryKey: ['cohort', 'stats', user?.id, cohortKey],
    queryFn: async () => {
      const { stats, error } = await fetchCohortAnonymousStats(cohortKey ?? undefined);
      if (error) throw error;
      return stats;
    },
    enabled: Boolean(user?.id && cohortKey),
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['cohort'] });
  };

  return {
    profile: profileQuery.data as UserCohortProfile | null | undefined,
    stats: statsQuery.data as CohortAnonymousStats | null | undefined,
    isRegistered: Boolean(cohortKey),
    isLoading: profileQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    fetchError: profileQuery.error,
    invalidate,
    refetch: profileQuery.refetch,
  };
}
