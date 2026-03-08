-- Bootstrap user_learning_profiles on first learning activity
-- Ensures profile row exists when user first does quiz (learning_sessions) or article read (learning_progress).
--
-- current_streak_days update design (separate concern):
-- - Option A: App calls updateStreak (streak_records) and syncs to user_learning_profiles.current_streak_days
-- - Option B: Future migration adds streak computation to this trigger using learning_sessions.created_at
--   and learning_progress.last_read_at to compute consecutive activity days

-- Shared function: upsert user_learning_profiles (bootstrap only, no streak computation)
CREATE OR REPLACE FUNCTION public.ensure_user_learning_profile(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO user_learning_profiles (user_id, updated_at)
  VALUES (p_user_id, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id)
  DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;
END;
$function$;

-- Trigger function for learning_sessions (quiz activity)
CREATE OR REPLACE FUNCTION public.update_user_learning_profile_on_session()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM ensure_user_learning_profile(NEW.user_id);
  RETURN NEW;
END;
$function$;

-- Trigger function for learning_progress (article read activity)
CREATE OR REPLACE FUNCTION public.update_user_learning_profile_on_progress()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM ensure_user_learning_profile(NEW.user_id);
  RETURN NEW;
END;
$function$;

-- Drop legacy trigger if it exists (from 20260308)
DROP TRIGGER IF EXISTS trigger_update_user_learning_profile ON learning_sessions;

-- Attach trigger to learning_sessions
DROP TRIGGER IF EXISTS trigger_update_profile_on_learning_session ON learning_sessions;
CREATE TRIGGER trigger_update_profile_on_learning_session
  AFTER INSERT ON learning_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_learning_profile_on_session();

-- Attach trigger to learning_progress (article read)
DROP TRIGGER IF EXISTS trigger_update_profile_on_learning_progress ON learning_progress;
CREATE TRIGGER trigger_update_profile_on_learning_progress
  AFTER INSERT OR UPDATE OF last_read_at ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_learning_profile_on_progress();
