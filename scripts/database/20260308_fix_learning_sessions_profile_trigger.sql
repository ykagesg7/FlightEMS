-- Fix learning_sessions trigger for current user_learning_profiles schema
-- The legacy trigger function still referenced removed study-time columns.

CREATE OR REPLACE FUNCTION public.update_user_learning_profile()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO user_learning_profiles (user_id, updated_at)
  VALUES (NEW.user_id, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id)
  DO UPDATE SET
    updated_at = CURRENT_TIMESTAMP;

  RETURN NEW;
END;
$function$;
