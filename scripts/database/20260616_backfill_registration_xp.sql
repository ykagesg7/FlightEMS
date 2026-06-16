-- Backfill registration XP (100) for users who completed onboarding
-- before award_xp_event was deployed.

WITH eligible AS (
  SELECT p.id
  FROM public.profiles p
  WHERE p.onboarding_completed_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.xp_award_events x
      WHERE x.user_id = p.id
        AND x.event_type = 'registration'
    )
),
inserted AS (
  INSERT INTO public.xp_award_events (user_id, event_type, event_key, xp_amount)
  SELECT id, 'registration', 'welcome_setup', 100
  FROM eligible
  RETURNING user_id
)
UPDATE public.profiles p
SET xp_points = COALESCE(p.xp_points, 0) + 100
FROM inserted i
WHERE p.id = i.user_id;
