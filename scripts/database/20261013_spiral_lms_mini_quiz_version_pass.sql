-- Spiral matrix LMS: tie mini-quiz pass / result disclosure to the current question-set version.
-- Apply via Supabase migration pipeline only after 上様 approval.
-- mini_quiz_version is learner-visible: stems use stem_revision; keys use key_revision only (no answer ids).

BEGIN;

ALTER TABLE public.node_mini_quiz_questions
  ADD COLUMN IF NOT EXISTS stem_revision integer NOT NULL DEFAULT 1;

ALTER TABLE public.node_mini_quiz_questions
  DROP CONSTRAINT IF EXISTS node_mini_quiz_questions_stem_revision_positive;

ALTER TABLE public.node_mini_quiz_questions
  ADD CONSTRAINT node_mini_quiz_questions_stem_revision_positive
  CHECK (stem_revision >= 1);

COMMENT ON COLUMN public.node_mini_quiz_questions.stem_revision IS
  'Global sequence revision on every INSERT/UPDATE; included in mini_quiz_version (no answer material). Manual values are ignored.';

ALTER TABLE private.node_mini_quiz_answer_keys
  ADD COLUMN IF NOT EXISTS key_revision integer NOT NULL DEFAULT 1;

ALTER TABLE private.node_mini_quiz_answer_keys
  DROP CONSTRAINT IF EXISTS node_mini_quiz_answer_keys_key_revision_positive;

ALTER TABLE private.node_mini_quiz_answer_keys
  ADD CONSTRAINT node_mini_quiz_answer_keys_key_revision_positive
  CHECK (key_revision >= 1);

COMMENT ON COLUMN private.node_mini_quiz_answer_keys.key_revision IS
  'Global sequence revision on every INSERT/UPDATE; revision number only is exposed via mini_quiz_version. Manual values are ignored.';

CREATE SEQUENCE IF NOT EXISTS private.spiral_lms_mini_quiz_revision_seq;

DROP FUNCTION IF EXISTS private.spiral_lms_bump_question_stem_revision();
DROP FUNCTION IF EXISTS private.spiral_lms_bump_answer_key_revision();

UPDATE public.node_mini_quiz_questions
SET stem_revision = nextval('private.spiral_lms_mini_quiz_revision_seq')
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_trigger
  WHERE tgname = 'trg_node_mini_quiz_questions_assign_stem_revision'
    AND tgrelid = 'public.node_mini_quiz_questions'::regclass
);

UPDATE private.node_mini_quiz_answer_keys k
SET key_revision = nextval('private.spiral_lms_mini_quiz_revision_seq')
WHERE NOT EXISTS (
  SELECT 1
  FROM pg_trigger
  WHERE tgname = 'trg_node_mini_quiz_answer_keys_assign_key_revision'
    AND tgrelid = 'private.node_mini_quiz_answer_keys'::regclass
);

CREATE OR REPLACE FUNCTION private.spiral_lms_assign_question_stem_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.stem_revision := nextval('private.spiral_lms_mini_quiz_revision_seq');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_node_mini_quiz_questions_bump_stem_revision ON public.node_mini_quiz_questions;
DROP TRIGGER IF EXISTS trg_node_mini_quiz_questions_assign_stem_revision ON public.node_mini_quiz_questions;
CREATE TRIGGER trg_node_mini_quiz_questions_assign_stem_revision
  BEFORE INSERT OR UPDATE ON public.node_mini_quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION private.spiral_lms_assign_question_stem_revision();

CREATE OR REPLACE FUNCTION private.spiral_lms_assign_answer_key_revision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.key_revision := nextval('private.spiral_lms_mini_quiz_revision_seq');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_node_mini_quiz_answer_keys_bump_key_revision ON private.node_mini_quiz_answer_keys;
DROP TRIGGER IF EXISTS trg_node_mini_quiz_answer_keys_assign_key_revision ON private.node_mini_quiz_answer_keys;
CREATE TRIGGER trg_node_mini_quiz_answer_keys_assign_key_revision
  BEFORE INSERT OR UPDATE ON private.node_mini_quiz_answer_keys
  FOR EACH ROW
  EXECUTE FUNCTION private.spiral_lms_assign_answer_key_revision();

CREATE OR REPLACE FUNCTION private.spiral_lms_canonical_chunk(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT length(coalesce(p_text, ''))::text || ':' || coalesce(p_text, '');
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_node_mini_quiz_version(p_node_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'v2'
    || coalesce(
      (
        SELECT '|s|' || coalesce(
          (
            SELECT string_agg(
              private.spiral_lms_canonical_chunk(q.id::text)
                || private.spiral_lms_canonical_chunk(q.prompt)
                || private.spiral_lms_canonical_chunk(q.question_type)
                || private.spiral_lms_canonical_chunk(q.options::text)
                || private.spiral_lms_canonical_chunk(q.stem_revision::text),
              '' ORDER BY q.sort_order, q.id
            )
            FROM public.node_mini_quiz_questions q
            WHERE q.node_id = p_node_id
          ),
          ''
        )
        || '|k|' || coalesce(
          (
            SELECT string_agg(
              private.spiral_lms_canonical_chunk(q.id::text)
                || private.spiral_lms_canonical_chunk(k.key_revision::text),
              '' ORDER BY q.sort_order, q.id
            )
            FROM public.node_mini_quiz_questions q
            INNER JOIN private.node_mini_quiz_answer_keys k ON k.question_id = q.id
            WHERE q.node_id = p_node_id
          ),
          ''
        )
      ),
      '|s||k|'
    );
$$;

COMMENT ON FUNCTION private.spiral_lms_node_mini_quiz_version(text) IS
  'Learner-visible quiz set version: length-prefixed stems + per-question key_revision integers (no correct_option_ids).';

ALTER TABLE public.user_attempts
  ADD COLUMN IF NOT EXISTS mini_quiz_version text;

COMMENT ON COLUMN public.user_attempts.mini_quiz_version IS
  'Snapshot of spiral_lms_node_mini_quiz_version at attempt time; no answer key material.';

UPDATE public.user_attempts ua
SET mini_quiz_version = private.spiral_lms_node_mini_quiz_version(ua.node_id)
WHERE ua.attempt_kind = 'mini_quiz'
  AND ua.mini_quiz_version IS NULL;

ALTER TABLE public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_mini_quiz_version_kind_check;

ALTER TABLE public.user_attempts
  ADD CONSTRAINT user_attempts_mini_quiz_version_kind_check
  CHECK (
    (attempt_kind = 'content_view' AND mini_quiz_version IS NULL)
    OR attempt_kind = 'mini_quiz'
  );

CREATE OR REPLACE FUNCTION private.spiral_lms_mini_quiz_met(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN n.passing_score IS NULL THEN true
    ELSE EXISTS (
      SELECT 1
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.node_id = p_node_id
        AND ua.attempt_kind = 'mini_quiz'
        AND ua.passed = true
        AND ua.score IS NOT NULL
        AND ua.score >= n.passing_score
        AND ua.mini_quiz_version IS NOT DISTINCT FROM private.spiral_lms_node_mini_quiz_version(p_node_id)
    )
  END
  FROM public.nodes n
  WHERE n.id = p_node_id;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(
  p_user_id uuid,
  p_node_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_attempts ua
    INNER JOIN public.nodes n ON n.id = ua.node_id
    WHERE ua.user_id = p_user_id
      AND ua.node_id = p_node_id
      AND ua.attempt_kind = 'mini_quiz'
      AND ua.passed = true
      AND ua.score IS NOT NULL
      AND ua.score >= n.passing_score
      AND ua.mini_quiz_version IS NOT DISTINCT FROM private.spiral_lms_node_mini_quiz_version(p_node_id)
  );
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_record_attempt_core(
  p_user_id uuid,
  p_node_id text,
  p_attempt_kind text,
  p_client_attempt_id uuid,
  p_content_slug text,
  p_score numeric,
  p_passed boolean,
  p_mini_quiz_answers jsonb DEFAULT NULL,
  p_mini_quiz_results jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt_id uuid;
  v_progress public.user_progress%ROWTYPE;
  v_existing public.user_attempts%ROWTYPE;
  v_normalized jsonb;
  v_mini_quiz_version text;
BEGIN
  v_normalized := CASE
    WHEN p_attempt_kind = 'mini_quiz' THEN p_mini_quiz_answers
    ELSE NULL
  END;

  v_mini_quiz_version := CASE
    WHEN p_attempt_kind = 'mini_quiz' THEN private.spiral_lms_node_mini_quiz_version(p_node_id)
    ELSE NULL
  END;

  SELECT * INTO v_existing
  FROM public.user_attempts ua
  WHERE ua.user_id = p_user_id
    AND ua.client_attempt_id = p_client_attempt_id;

  IF FOUND THEN
    IF NOT private.spiral_lms_attempt_payload_matches(
      v_existing,
      p_node_id,
      p_attempt_kind,
      p_content_slug,
      p_score,
      v_normalized
    ) THEN
      RAISE EXCEPTION 'idempotency_conflict'
        USING ERRCODE = '22023';
    END IF;

    RETURN private.spiral_lms_build_attempt_response(p_user_id, v_existing);
  END IF;

  BEGIN
    INSERT INTO public.user_attempts (
      user_id,
      node_id,
      content_slug,
      attempt_kind,
      client_attempt_id,
      score,
      passed,
      mini_quiz_answers,
      mini_quiz_version
    )
    VALUES (
      p_user_id,
      p_node_id,
      CASE WHEN p_attempt_kind = 'content_view' THEN p_content_slug ELSE NULL END,
      p_attempt_kind,
      p_client_attempt_id,
      p_score,
      p_passed,
      v_normalized,
      v_mini_quiz_version
    )
    RETURNING id INTO v_attempt_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT * INTO v_existing
      FROM public.user_attempts ua
      WHERE ua.user_id = p_user_id
        AND ua.client_attempt_id = p_client_attempt_id;

      IF NOT FOUND THEN
        RAISE;
      END IF;

      IF NOT private.spiral_lms_attempt_payload_matches(
        v_existing,
        p_node_id,
        p_attempt_kind,
        p_content_slug,
        p_score,
        v_normalized
      ) THEN
        RAISE EXCEPTION 'idempotency_conflict'
          USING ERRCODE = '22023';
      END IF;

      RETURN private.spiral_lms_build_attempt_response(p_user_id, v_existing);
  END;

  INSERT INTO public.user_progress (user_id, node_id, status, attempts, last_attempt_at)
  VALUES (p_user_id, p_node_id, 'LOCKED', 1, now())
  ON CONFLICT (user_id, node_id) DO UPDATE SET
    attempts = user_progress.attempts + 1,
    last_attempt_at = now(),
    updated_at = now();

  PERFORM private.spiral_lms_recompute_all_published_nodes(p_user_id);

  SELECT * INTO v_progress
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND node_id = p_node_id;

  RETURN jsonb_build_object(
    'success', true,
    'idempotent', false,
    'attempt_id', v_attempt_id,
    'passed', p_passed,
    'node_id', p_node_id,
    'node_status', v_progress.status,
    'content_slug', p_content_slug,
    'score', p_score,
    'results', NULL::jsonb
  );
END;
$$;

ALTER FUNCTION private.spiral_lms_canonical_chunk(text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_assign_question_stem_revision() OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_assign_answer_key_revision() OWNER TO postgres;
ALTER SEQUENCE private.spiral_lms_mini_quiz_revision_seq OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_node_mini_quiz_version(text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_canonical_chunk(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_assign_question_stem_revision() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_assign_answer_key_revision() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE private.spiral_lms_mini_quiz_revision_seq FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_node_mini_quiz_version(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) FROM PUBLIC, anon, authenticated;

COMMIT;
