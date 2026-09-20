-- Learning console 401/400: widen learning_sessions CHECKs to the client
-- payloads, and GRANT anon the catalog reads the SPA always fires.
-- Non-destructive: DROP+ADD wider CHECKs, GRANT SELECT/INSERT, CREATE POLICY.
-- No row deletes.

-- Client reading dwell uses content_type 'lesson' | 'article'.
-- Quiz hub insert uses content_type 'quiz' and session_type 'practice' | 'exam' | 'review'.
-- Production 2026-09-20 03:01–03:07: HTTP 400 + SQLSTATE 23514
--   learning_sessions_content_type_check (payload content_type = quiz / lesson).

ALTER TABLE public.learning_sessions
  DROP CONSTRAINT IF EXISTS learning_sessions_content_type_check;

ALTER TABLE public.learning_sessions
  ADD CONSTRAINT learning_sessions_content_type_check
  CHECK (
    (content_type)::text = ANY (
      (ARRAY[
        'article'::character varying,
        'test'::character varying,
        'video'::character varying,
        'exercise'::character varying,
        'lesson'::character varying,
        'quiz'::character varying
      ])::text[]
    )
  );

ALTER TABLE public.learning_sessions
  DROP CONSTRAINT IF EXISTS learning_sessions_session_type_check;

ALTER TABLE public.learning_sessions
  ADD CONSTRAINT learning_sessions_session_type_check
  CHECK (
    (session_type)::text = ANY (
      (ARRAY[
        'reading'::character varying,
        'testing'::character varying,
        'review'::character varying,
        'practice'::character varying,
        'exam'::character varying
      ])::text[]
    )
  );

-- Anon JWT (no user, or session not yet restored) was HTTP 401 / 42501:
--   permission denied for view learning_content_stats
--   permission denied for table learning_content_comments
--   permission denied for table learning_content_views
--   permission denied for table learning_test_mapping
-- Authenticated already has table GRANT; RLS on mapping is verified-only SELECT.
GRANT SELECT ON TABLE public.learning_content_stats TO anon;
GRANT SELECT ON TABLE public.learning_content_comments TO anon;
GRANT SELECT ON TABLE public.learning_content_likes TO anon;
GRANT SELECT ON TABLE public.learning_test_mapping TO anon;
GRANT SELECT, INSERT ON TABLE public.learning_content_views TO anon;

-- Comments were owner-only ALL, so even with GRANT the list was empty for others.
-- Article pages load comments for every visitor; public SELECT matches that UI.
DROP POLICY IF EXISTS learning_content_comments_select_public ON public.learning_content_comments;
CREATE POLICY learning_content_comments_select_public
  ON public.learning_content_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);
