-- Rollback: 20261013_spiral_lms_mini_quiz_version_pass.sql
-- Restores PR ④ definitions for mini_quiz_met / ever_passed / record_attempt_core.

BEGIN;

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
BEGIN
  v_normalized := CASE
    WHEN p_attempt_kind = 'mini_quiz' THEN p_mini_quiz_answers
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
      mini_quiz_answers
    )
    VALUES (
      p_user_id,
      p_node_id,
      CASE WHEN p_attempt_kind = 'content_view' THEN p_content_slug ELSE NULL END,
      p_attempt_kind,
      p_client_attempt_id,
      p_score,
      p_passed,
      v_normalized
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

ALTER TABLE public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_mini_quiz_version_kind_check;

ALTER TABLE public.user_attempts
  DROP COLUMN IF EXISTS mini_quiz_version;

DROP TRIGGER IF EXISTS trg_node_mini_quiz_answer_keys_bump_key_revision ON private.node_mini_quiz_answer_keys;
DROP TRIGGER IF EXISTS trg_node_mini_quiz_questions_bump_stem_revision ON public.node_mini_quiz_questions;

DROP FUNCTION IF EXISTS private.spiral_lms_bump_answer_key_revision();
DROP FUNCTION IF EXISTS private.spiral_lms_bump_question_stem_revision();
DROP FUNCTION IF EXISTS private.spiral_lms_node_mini_quiz_version(text);
DROP FUNCTION IF EXISTS private.spiral_lms_canonical_chunk(text);

ALTER TABLE private.node_mini_quiz_answer_keys
  DROP CONSTRAINT IF EXISTS node_mini_quiz_answer_keys_key_revision_positive;

ALTER TABLE private.node_mini_quiz_answer_keys
  DROP COLUMN IF EXISTS key_revision;

ALTER TABLE public.node_mini_quiz_questions
  DROP CONSTRAINT IF EXISTS node_mini_quiz_questions_stem_revision_positive;

ALTER TABLE public.node_mini_quiz_questions
  DROP COLUMN IF EXISTS stem_revision;

ALTER FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_met(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) FROM PUBLIC, anon, authenticated;

COMMIT;
