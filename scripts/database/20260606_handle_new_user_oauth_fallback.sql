-- OAuth 初回登録時に username が空にならないよう handle_new_user を更新
-- 正本: scripts/database/20260511_security_definer_rpc_hardening.sql の関数を置換

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  resolved_username text;
BEGIN
  resolved_username := COALESCE(
    NULLIF(trim(new.raw_user_meta_data->>'username'), ''),
    NULLIF(trim(new.raw_user_meta_data->>'full_name'), ''),
    NULLIF(trim(new.raw_user_meta_data->>'name'), ''),
    NULLIF(split_part(new.email, '@', 1), ''),
    'Learner'
  );

  INSERT INTO public.profiles (id, username, email, roll, created_at, updated_at)
  VALUES (
    new.id,
    resolved_username,
    new.email,
    'Student',
    now(),
    now()
  );

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
