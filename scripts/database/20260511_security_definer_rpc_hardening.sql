-- Security Advisor (linter 0028 / 0029): reduce callable SECURITY DEFINER on public PostgREST RPC.
-- Applied to project via Supabase MCP migration name: security_definer_rpc_hardening_20260511
--
-- Do not add schema `private` to API "Exposed schemas" — or private.* implementations become RPC-callable.
--
-- Strategy:
-- - get_learning_xp_benchmark / get_public_leaderboard: DEFINER bodies in private.*; public.* thin INVOKER wrappers.
-- - check_password_strength / create_user_learning_profile: INVOkER (no privilege elevation).
-- - Trigger-only functions: remain DEFINER where needed for storage; REVOKE EXECUTE from anon/authenticated/PUBLIC.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.get_learning_xp_benchmark_impl()
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

ALTER FUNCTION private.get_learning_xp_benchmark_impl() OWNER TO postgres;

CREATE OR REPLACE FUNCTION private.get_public_leaderboard_impl(p_limit integer)
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

ALTER FUNCTION private.get_public_leaderboard_impl(integer) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.get_learning_xp_benchmark_impl() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_public_leaderboard_impl(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.get_learning_xp_benchmark_impl() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_public_leaderboard_impl(integer) TO authenticated;

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
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM private.get_learning_xp_benchmark_impl();
$$;

CREATE OR REPLACE FUNCTION public.get_public_leaderboard(p_limit integer DEFAULT 30)
RETURNS TABLE (
  display_name text,
  xp_points integer,
  rank user_rank_type,
  leaderboard_position bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT * FROM private.get_public_leaderboard_impl(p_limit);
$$;

REVOKE ALL ON FUNCTION public.get_learning_xp_benchmark() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_learning_xp_benchmark() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_leaderboard(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO public
AS $function$
BEGIN
    RETURN (
        length(password) >= 8 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]'
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.check_password_strength(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_password_strength(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_user_learning_profile(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO public
AS $function$
DECLARE
  profile_id uuid;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'create_user_learning_profile: forbidden'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO user_learning_profiles (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO profile_id;

  RETURN profile_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_user_learning_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_user_learning_profile(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_user_notification_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO user_notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_post_images()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, storage
AS $function$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'post-images' AND (metadata->>'post_id')::uuid = OLD.id;
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_user_images()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, storage
AS $function$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'post-images' AND owner = OLD.id;
  RETURN OLD;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_user_notification_settings() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_post_images() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_images() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

REVOKE ALL ON FUNCTION public.create_user_notification_settings() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_post_images() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_user_images() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
