-- Fix article XP awarding: track xp_awarded_at on learning_progress (idempotent).
-- Replaces completed=true-only dedup which blocked awards after progress upsert.

ALTER TABLE public.learning_progress
  ADD COLUMN IF NOT EXISTS xp_awarded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_learning_progress_xp_awarded
  ON public.learning_progress (user_id, content_id)
  WHERE xp_awarded_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.award_article_xp(
  p_user_id UUID,
  p_article_slug TEXT,
  p_xp_amount INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  progress_row public.learning_progress%ROWTYPE;
  old_rank public.user_rank_type;
  new_xp INTEGER;
  new_rank public.user_rank_type;
  rank_up BOOLEAN := false;
  result JSON;
BEGIN
  IF p_xp_amount IS NULL OR p_xp_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid XP amount');
  END IF;

  SELECT * INTO progress_row
  FROM public.learning_progress
  WHERE user_id = p_user_id
    AND content_id = p_article_slug
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Learning progress not found; save completion before awarding XP'
    );
  END IF;

  IF NOT progress_row.completed AND progress_row.progress_percentage < 95 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Article not completed yet'
    );
  END IF;

  IF progress_row.xp_awarded_at IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'XP already awarded for this article'
    );
  END IF;

  SELECT rank INTO old_rank FROM public.profiles WHERE id = p_user_id;

  UPDATE public.profiles
  SET xp_points = COALESCE(xp_points, 0) + p_xp_amount
  WHERE id = p_user_id
  RETURNING xp_points, rank INTO new_xp, new_rank;

  UPDATE public.learning_progress
  SET xp_awarded_at = NOW(),
      updated_at = NOW()
  WHERE id = progress_row.id;

  rank_up := (old_rank IS DISTINCT FROM new_rank);

  SELECT json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_xp', new_xp,
    'new_rank', new_rank,
    'old_rank', old_rank,
    'rank_up', rank_up
  ) INTO result;

  RETURN result;
END;
$function$;

-- One-time backfill: users with 0 XP get 35 XP per completed article (25 + first-read 10).
WITH to_award AS (
  SELECT
    lp.user_id,
    lp.id AS progress_id,
    35 AS xp_amount
  FROM public.learning_progress lp
  INNER JOIN public.profiles p ON p.id = lp.user_id
  WHERE lp.completed = true
    AND lp.xp_awarded_at IS NULL
    AND COALESCE(p.xp_points, 0) = 0
),
user_totals AS (
  SELECT user_id, SUM(xp_amount)::INTEGER AS total_xp
  FROM to_award
  GROUP BY user_id
),
apply_xp AS (
  UPDATE public.profiles p
  SET xp_points = COALESCE(p.xp_points, 0) + ut.total_xp
  FROM user_totals ut
  WHERE p.id = ut.user_id
  RETURNING p.id
)
UPDATE public.learning_progress lp
SET xp_awarded_at = NOW(),
    updated_at = NOW()
FROM to_award ta
WHERE lp.id = ta.progress_id;

-- Users who already have XP: stamp completed rows only (no duplicate XP).
UPDATE public.learning_progress lp
SET xp_awarded_at = NOW(),
    updated_at = NOW()
FROM public.profiles p
WHERE lp.user_id = p.id
  AND lp.completed = true
  AND lp.xp_awarded_at IS NULL
  AND COALESCE(p.xp_points, 0) > 0;
