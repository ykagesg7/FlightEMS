-- Learning dashboard: XP benchmark RPC (SECURITY DEFINER). See 20260324_learning_xp_benchmark_and_leaderboard.sql for full bundle.

CREATE INDEX IF NOT EXISTS idx_profiles_xp_points ON public.profiles (xp_points);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON public.profiles (rank);

CREATE OR REPLACE FUNCTION public.get_learning_xp_benchmark()
RETURNS TABLE (
  xp_points integer,
  population_n bigint,
  percentile numeric,
  rank_tier user_rank_type,
  cohort_n bigint,
  cohort_percentile numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH me AS (
    SELECT p.xp_points, p.rank
    FROM public.profiles p
    WHERE p.id = auth.uid()
    LIMIT 1
  ),
  pop AS (
    SELECT count(*) FILTER (WHERE coalesce(xp_points, 0) > 0)::bigint AS n
    FROM public.profiles
  )
  SELECT
    coalesce(me.xp_points, 0)::integer,
    pop.n,
    CASE WHEN pop.n > 0 THEN
      round(
        100.0 * (
          SELECT count(*)::numeric
          FROM public.profiles p
          CROSS JOIN me
          WHERE coalesce(p.xp_points, 0) > 0
            AND coalesce(p.xp_points, 0) < coalesce(me.xp_points, 0)
        ) / pop.n,
        1
      )
    ELSE NULL END,
    me.rank,
    (
      SELECT count(*) FILTER (WHERE coalesce(p2.xp_points, 0) > 0)::bigint
      FROM public.profiles p2
      CROSS JOIN me
      WHERE p2.rank IS NOT DISTINCT FROM me.rank
    ),
    CASE
      WHEN (
        SELECT count(*) FILTER (WHERE coalesce(p2.xp_points, 0) > 0)::bigint
        FROM public.profiles p2
        CROSS JOIN me
        WHERE p2.rank IS NOT DISTINCT FROM me.rank
      ) > 0 THEN
        round(
          100.0 * (
            SELECT count(*)::numeric
            FROM public.profiles p
            CROSS JOIN me
            WHERE coalesce(p.xp_points, 0) > 0
              AND p.rank IS NOT DISTINCT FROM me.rank
              AND coalesce(p.xp_points, 0) < coalesce(me.xp_points, 0)
          ) / (
            SELECT count(*)::numeric
            FROM public.profiles p2
            CROSS JOIN me
            WHERE coalesce(p2.xp_points, 0) > 0
              AND p2.rank IS NOT DISTINCT FROM me.rank
          ),
          1
        )
      ELSE NULL
    END
  FROM me
  CROSS JOIN pop;
$$;

REVOKE ALL ON FUNCTION public.get_learning_xp_benchmark() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_learning_xp_benchmark() TO authenticated;
