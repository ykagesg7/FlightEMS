-- Learning dashboard: XP benchmark (SECURITY DEFINER) + optional public leaderboard columns/RPC.
-- Docs: docs/05_設計仕様書.md（ダッシュボード相対位置・ランキング）
--
-- 運用: Supabase MCP の `apply_migration` が長大 SQL で失敗する場合は、次を順に適用する。
--   1) 20260324_learning_xp_benchmark.sql  → migration name: learning_xp_benchmark
--   2) 20260324_leaderboard_opt_in.sql     → migration name: leaderboard_opt_in

-- Indexes for benchmark aggregations (optional but helps at scale)
CREATE INDEX IF NOT EXISTS idx_profiles_xp_points ON public.profiles (xp_points);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON public.profiles (rank);

-- Returns only the caller's XP and aggregate stats (no other user ids).
-- population_n: profiles with coalesce(xp_points,0) > 0
-- percentile: among that population, % with strictly lower XP than the caller (0-100)
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

-- Phase 2: opt-in public leaderboard (display name rules in docs)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS leaderboard_display_name text;

CREATE OR REPLACE FUNCTION public.get_public_leaderboard(p_limit integer DEFAULT 30)
RETURNS TABLE (
  display_name text,
  xp_points integer,
  rank user_rank_type,
  leaderboard_position bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sub.display_name,
         sub.xp_points::integer,
         sub.rank,
         sub.pos
  FROM (
    SELECT
      COALESCE(
        NULLIF(trim(p.leaderboard_display_name), ''),
        NULLIF(trim(p.username), ''),
        'Learner'
      ) AS display_name,
      coalesce(p.xp_points, 0) AS xp_points,
      p.rank,
      row_number() OVER (ORDER BY coalesce(p.xp_points, 0) DESC, p.id) AS pos
    FROM public.profiles p
    WHERE p.leaderboard_opt_in = true
  ) sub
  WHERE sub.pos <= least(coalesce(p_limit, 30), 50)
  ORDER BY sub.pos;
$$;

REVOKE ALL ON FUNCTION public.get_public_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard(integer) TO authenticated;
