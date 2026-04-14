-- Supabase Database Linter security fixes (2026-04-14)
-- Apply in SQL Editor or via migration tooling.
-- Covers: 0011_function_search_path_mutable, 0024_permissive_rls_policy, 0025_public_bucket_allows_listing
--
-- NOT addressed here (dashboard / platform):
-- - auth_leaked_password_protection: Auth → Providers → Email → enable leaked password protection
-- - vulnerable_postgres_version: Project Settings → Infrastructure → upgrade Postgres

-- ---------------------------------------------------------------------------
-- 1) function_search_path_mutable — pin search_path (idempotent with CREATE scripts)
-- ---------------------------------------------------------------------------
ALTER FUNCTION public.check_and_award_ppl_ranks(uuid, text) SET search_path = public;
ALTER FUNCTION public.check_rank_requirements(uuid, user_rank_type) SET search_path = public;
ALTER FUNCTION public.trigger_update_profile_rank_on_ppl_rank() SET search_path = public;
ALTER FUNCTION public.map_ppl_rank_code_to_user_rank_type(text) SET search_path = public;
ALTER FUNCTION public.update_profile_rank_for_ppl(uuid) SET search_path = public;

-- ---------------------------------------------------------------------------
-- 2) rls_policy_always_true — replace open INSERT/DELETE with scoped checks
--    App behavior: likes = authenticated only; views = authenticated OR anon + session_id
-- ---------------------------------------------------------------------------
ALTER TABLE public.learning_content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "いいねは誰でも挿入可能" ON public.learning_content_likes;
DROP POLICY IF EXISTS "いいねは誰でも削除可能" ON public.learning_content_likes;
DROP POLICY IF EXISTS "閲覧記録は誰でも挿入可能" ON public.learning_content_views;

DROP POLICY IF EXISTS "learning_content_likes_insert_own" ON public.learning_content_likes;
DROP POLICY IF EXISTS "learning_content_likes_delete_own" ON public.learning_content_likes;
DROP POLICY IF EXISTS "learning_content_views_insert_authenticated" ON public.learning_content_views;
DROP POLICY IF EXISTS "learning_content_views_insert_anon_session" ON public.learning_content_views;

CREATE POLICY "learning_content_likes_insert_own"
  ON public.learning_content_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "learning_content_likes_delete_own"
  ON public.learning_content_likes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "learning_content_views_insert_authenticated"
  ON public.learning_content_views
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.learning_contents lc WHERE lc.id = content_id
    )
  );

CREATE POLICY "learning_content_views_insert_anon_session"
  ON public.learning_content_views
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL
    AND session_id IS NOT NULL
    AND length(trim(session_id)) > 0
    AND EXISTS (
      SELECT 1 FROM public.learning_contents lc WHERE lc.id = content_id
    )
  );

-- ---------------------------------------------------------------------------
-- 3) public_bucket_allows_listing — drop broad SELECT on storage.objects
--    Public object URLs still work; listing via API no longer enumerates the bucket.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "fan_photos_public_select" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view images" ON storage.objects;
