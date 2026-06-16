-- Generic idempotent XP events (registration, quiz sessions, etc.)

CREATE TABLE IF NOT EXISTS public.xp_award_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_key TEXT NOT NULL,
  xp_amount INTEGER NOT NULL CHECK (xp_amount > 0),
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_type, event_key)
);

CREATE INDEX IF NOT EXISTS idx_xp_award_events_user_id
  ON public.xp_award_events (user_id);

ALTER TABLE public.xp_award_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS xp_award_events_select_own ON public.xp_award_events;
CREATE POLICY xp_award_events_select_own ON public.xp_award_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.award_xp_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_key TEXT,
  p_xp_amount INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  old_rank public.user_rank_type;
  new_xp INTEGER;
  new_rank public.user_rank_type;
  result JSON;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  IF p_xp_amount IS NULL OR p_xp_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid XP amount');
  END IF;

  IF p_event_type IS NULL OR length(trim(p_event_type)) = 0
     OR p_event_key IS NULL OR length(trim(p_event_key)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid event');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.xp_award_events
    WHERE user_id = p_user_id
      AND event_type = p_event_type
      AND event_key = p_event_key
  ) THEN
    RETURN json_build_object('success', false, 'error', 'XP already awarded for this event');
  END IF;

  SELECT rank INTO old_rank FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;

  INSERT INTO public.xp_award_events (user_id, event_type, event_key, xp_amount)
  VALUES (p_user_id, p_event_type, p_event_key, p_xp_amount);

  UPDATE public.profiles
  SET xp_points = COALESCE(xp_points, 0) + p_xp_amount
  WHERE id = p_user_id
  RETURNING xp_points, rank INTO new_xp, new_rank;

  SELECT json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_xp', new_xp,
    'new_rank', new_rank,
    'old_rank', old_rank,
    'rank_up', (old_rank IS DISTINCT FROM new_rank)
  ) INTO result;

  RETURN result;
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'XP already awarded for this event');
END;
$function$;

REVOKE ALL ON FUNCTION public.award_xp_event(UUID, TEXT, TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.award_xp_event(UUID, TEXT, TEXT, INTEGER) TO authenticated;
