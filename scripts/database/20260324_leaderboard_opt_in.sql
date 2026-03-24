-- Opt-in public leaderboard columns + RPC. Bundled in 20260324_learning_xp_benchmark_and_leaderboard.sql for reference.

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
