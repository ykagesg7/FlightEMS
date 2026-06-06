-- profiles: welcome setup wizard completion timestamp
-- Existing users are backfilled so /welcome is not shown again.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

UPDATE profiles
SET onboarding_completed_at = COALESCE(updated_at, created_at, now())
WHERE onboarding_completed_at IS NULL;
