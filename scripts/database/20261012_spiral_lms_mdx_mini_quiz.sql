-- Spiral matrix LMS (MVP PR ④): MDX mini-quiz stems + server-side grading (submit_mini_quiz).
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).
-- Correct answers live in private.node_mini_quiz_answer_keys (no client SELECT).
-- Client-supplied scores for mini_quiz via record_attempt are rejected.

BEGIN;

-- ---------------------------------------------------------------------------
-- Public stems (options without correctness)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.node_mini_quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  prompt text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('single', 'multiple')),
  options jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT node_mini_quiz_questions_options_array CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT node_mini_quiz_questions_node_sort UNIQUE (node_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_node_mini_quiz_questions_node
  ON public.node_mini_quiz_questions (node_id, sort_order);

COMMENT ON TABLE public.node_mini_quiz_questions IS
  'Mini-quiz stems for spiral LMS nodes. Options are {id,text} only; grading keys are private.';

-- ---------------------------------------------------------------------------
-- Answer keys (postgres / SECURITY DEFINER only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS private.node_mini_quiz_answer_keys (
  question_id uuid PRIMARY KEY REFERENCES public.node_mini_quiz_questions (id) ON DELETE CASCADE,
  correct_option_ids text[] NOT NULL,
  CONSTRAINT node_mini_quiz_answer_keys_nonempty CHECK (cardinality(correct_option_ids) >= 1)
);

REVOKE ALL ON TABLE private.node_mini_quiz_answer_keys FROM PUBLIC, anon, authenticated;

ALTER TABLE private.node_mini_quiz_answer_keys ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.node_mini_quiz_questions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.node_mini_quiz_questions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.node_mini_quiz_questions TO authenticated;

CREATE OR REPLACE FUNCTION private.spiral_lms_node_mini_quiz_ready(p_node_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN NOT EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.id = p_node_id
        AND n.is_published = true
        AND n.passing_score IS NOT NULL
    ) THEN false
    WHEN (
      SELECT count(*)::integer
      FROM public.node_mini_quiz_questions q
      WHERE q.node_id = p_node_id
    ) = 0 THEN false
    ELSE NOT EXISTS (
      SELECT 1
      FROM public.node_mini_quiz_questions q
      WHERE q.node_id = p_node_id
        AND NOT EXISTS (
          SELECT 1
          FROM private.node_mini_quiz_answer_keys k
          WHERE k.question_id = q.id
        )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_mini_quiz_submissions_last_hour(
  p_user_id uuid,
  p_node_id text
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM public.user_attempts ua
  WHERE ua.user_id = p_user_id
    AND ua.node_id = p_node_id
    AND ua.attempt_kind = 'mini_quiz'
    AND ua.created_at > now() - interval '1 hour';
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

CREATE OR REPLACE FUNCTION private.spiral_lms_format_mini_quiz_response(
  p_user_id uuid,
  p_node_id text,
  p_core jsonb,
  p_results jsonb,
  p_passed boolean
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_show_results boolean;
BEGIN
  v_show_results := p_passed
    OR private.spiral_lms_user_node_mini_quiz_ever_passed(p_user_id, p_node_id);

  IF v_show_results THEN
    RETURN p_core
      || jsonb_build_object('score', p_core->'score')
      || jsonb_build_object('results', p_results);
  END IF;

  RETURN (p_core - 'score') || jsonb_build_object('results', NULL::jsonb);
END;
$$;

DROP POLICY IF EXISTS node_mini_quiz_questions_select_published ON public.node_mini_quiz_questions;
CREATE POLICY node_mini_quiz_questions_select_published
  ON public.node_mini_quiz_questions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.id = node_mini_quiz_questions.node_id
        AND n.is_published IS TRUE
        AND n.passing_score IS NOT NULL
    )
  );

-- ---------------------------------------------------------------------------
-- user_attempts: store submitted answers for mini_quiz idempotency
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_attempts
  ADD COLUMN IF NOT EXISTS mini_quiz_answers jsonb;

ALTER TABLE public.user_attempts
  DROP CONSTRAINT IF EXISTS user_attempts_mini_quiz_answers_kind_check;

ALTER TABLE public.user_attempts
  ADD CONSTRAINT user_attempts_mini_quiz_answers_kind_check
  CHECK (
    (attempt_kind = 'content_view' AND mini_quiz_answers IS NULL)
    OR attempt_kind = 'mini_quiz'
  );

COMMENT ON COLUMN public.user_attempts.mini_quiz_answers IS
  'Normalized answer payload for mini_quiz attempts; used for idempotency and audit.';

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.spiral_lms_normalize_mini_quiz_answers(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v_elem jsonb;
  v_question_id uuid;
  v_selected jsonb;
  v_out jsonb := '[]'::jsonb;
  v_seen uuid[] := ARRAY[]::uuid[];
BEGIN
  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'array' THEN
    RAISE EXCEPTION 'invalid_mini_quiz_answers'
      USING ERRCODE = '22023';
  END IF;

  IF jsonb_array_length(p_answers) = 0 THEN
    RAISE EXCEPTION 'empty_answers'
      USING ERRCODE = '22023';
  END IF;

  FOR v_elem IN SELECT value FROM jsonb_array_elements(p_answers) AS t(value)
  LOOP
    IF jsonb_typeof(v_elem) <> 'object' THEN
      RAISE EXCEPTION 'invalid_mini_quiz_answers'
        USING ERRCODE = '22023';
    END IF;

    BEGIN
      v_question_id := (v_elem->>'question_id')::uuid;
    EXCEPTION
      WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'invalid_mini_quiz_answers'
          USING ERRCODE = '22023';
    END;

    IF v_question_id = ANY (v_seen) THEN
      RAISE EXCEPTION 'invalid_mini_quiz_answers'
        USING ERRCODE = '22023';
    END IF;
    v_seen := array_append(v_seen, v_question_id);

    v_selected := v_elem->'selected_option_ids';
    IF v_selected IS NULL OR jsonb_typeof(v_selected) <> 'array' THEN
      RAISE EXCEPTION 'invalid_mini_quiz_answers'
        USING ERRCODE = '22023';
    END IF;

    IF jsonb_array_length(v_selected) = 0 THEN
      RAISE EXCEPTION 'empty_answers'
        USING ERRCODE = '22023';
    END IF;

    v_out := v_out || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_question_id::text,
        'selected_option_ids', (
          SELECT coalesce(jsonb_agg(elem ORDER BY elem), '[]'::jsonb)
          FROM jsonb_array_elements_text(v_selected) AS t(elem)
        )
      )
    );
  END LOOP;

  RETURN (
    SELECT coalesce(jsonb_agg(elem ORDER BY (elem->>'question_id')), '[]'::jsonb)
    FROM jsonb_array_elements(v_out) AS t(elem)
  );
END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_mini_quiz_answers_match(
  p_existing jsonb,
  p_normalized jsonb
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT p_existing IS NOT DISTINCT FROM p_normalized;
$$;

DROP FUNCTION IF EXISTS private.spiral_lms_attempt_payload_matches(
  public.user_attempts,
  text,
  text,
  text,
  numeric
);

CREATE OR REPLACE FUNCTION private.spiral_lms_attempt_payload_matches(
  p_existing public.user_attempts,
  p_node_id text,
  p_attempt_kind text,
  p_content_slug text,
  p_score numeric,
  p_mini_quiz_answers jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    p_existing.node_id = p_node_id
    AND p_existing.attempt_kind = p_attempt_kind
    AND p_existing.content_slug IS NOT DISTINCT FROM CASE
      WHEN p_attempt_kind = 'content_view' THEN p_content_slug
      ELSE NULL
    END
    AND p_existing.score IS NOT DISTINCT FROM p_score
    AND (
      p_attempt_kind <> 'mini_quiz'
      OR private.spiral_lms_mini_quiz_answers_match(
        p_existing.mini_quiz_answers,
        p_mini_quiz_answers
      )
    );
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_grade_mini_quiz(
  p_node_id text,
  p_normalized_answers jsonb
)
RETURNS TABLE (
  score numeric,
  passed boolean,
  results jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_passing_score numeric;
  v_total integer;
  v_correct integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_q record;
  v_selected text[];
  v_expected text[];
  v_is_correct boolean;
BEGIN
  SELECT n.passing_score INTO v_passing_score
  FROM public.nodes n
  WHERE n.id = p_node_id;

  IF v_passing_score IS NULL THEN
    RAISE EXCEPTION 'mini_quiz_not_configured'
      USING ERRCODE = '22023';
  END IF;

  IF NOT private.spiral_lms_node_mini_quiz_ready(p_node_id) THEN
    RAISE EXCEPTION 'quiz_not_ready'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*)::integer INTO v_total
  FROM public.node_mini_quiz_questions q
  WHERE q.node_id = p_node_id;

  IF jsonb_array_length(p_normalized_answers) <> v_total THEN
    RAISE EXCEPTION 'mini_quiz_incomplete'
      USING ERRCODE = '22023';
  END IF;

  FOR v_q IN
    SELECT
      q.id,
      q.question_type,
      q.options,
      k.correct_option_ids
    FROM public.node_mini_quiz_questions q
    INNER JOIN private.node_mini_quiz_answer_keys k ON k.question_id = q.id
    WHERE q.node_id = p_node_id
    ORDER BY q.sort_order
  LOOP
    SELECT array_agg(elem ORDER BY elem)
    INTO v_selected
    FROM jsonb_array_elements_text(
      (
        SELECT elem->'selected_option_ids'
        FROM jsonb_array_elements(p_normalized_answers) AS t(elem)
        WHERE (elem->>'question_id')::uuid = v_q.id
      )
    ) AS s(elem);

    IF v_selected IS NULL THEN
      RAISE EXCEPTION 'mini_quiz_unknown_question'
        USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM unnest(v_selected) AS sel(opt_id)
      WHERE NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(v_q.options) AS opt(elem)
        WHERE opt.elem->>'id' = sel.opt_id
      )
    ) THEN
      RAISE EXCEPTION 'invalid_answer'
        USING ERRCODE = '22023';
    END IF;

    v_expected := (
      SELECT array_agg(x ORDER BY x)
      FROM unnest(v_q.correct_option_ids) AS t(x)
    );

    IF v_q.question_type = 'single' THEN
      IF cardinality(v_selected) <> 1 THEN
        v_is_correct := false;
      ELSE
        v_is_correct := v_selected[1] = ANY (v_q.correct_option_ids);
      END IF;
    ELSE
      v_is_correct := v_selected = v_expected;
    END IF;

    IF v_is_correct THEN
      v_correct := v_correct + 1;
    END IF;

    v_results := v_results || jsonb_build_array(
      jsonb_build_object(
        'question_id', v_q.id::text,
        'correct', v_is_correct
      )
    );
  END LOOP;

  score := round((100::numeric * v_correct::numeric) / v_total::numeric, 2);
  score := private.spiral_lms_validate_score(score);
  passed := score >= v_passing_score;
  results := v_results;
  RETURN NEXT;
END;
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

CREATE OR REPLACE FUNCTION private.spiral_lms_validate_mini_quiz_submission(
  p_user_id uuid,
  p_node_id text
)
RETURNS public.nodes
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_node public.nodes%ROWTYPE;
BEGIN
  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RAISE EXCEPTION 'node_not_available'
      USING ERRCODE = '22023';
  END IF;

  IF v_node.opens_at IS NOT NULL AND v_node.opens_at > now() THEN
    RAISE EXCEPTION 'node_locked'
      USING ERRCODE = '22023';
  END IF;

  IF NOT private.spiral_lms_published_prerequisites_met(p_user_id, p_node_id) THEN
    RAISE EXCEPTION 'prerequisites_not_met'
      USING ERRCODE = '22023';
  END IF;

  IF coalesce(v_node.unlock_config->>'z_level_gate', '') <> 'off'
     AND NOT private.spiral_lms_z_level_gate_met(p_user_id, v_node.z_level) THEN
    RAISE EXCEPTION 'z_level_gate_locked'
      USING ERRCODE = '22023';
  END IF;

  IF v_node.passing_score IS NULL THEN
    RAISE EXCEPTION 'mini_quiz_not_configured'
      USING ERRCODE = '22023';
  END IF;

  RETURN v_node;
END;
$$;

-- ---------------------------------------------------------------------------
-- Public RPC: submit graded mini-quiz
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_node_mini_quiz_questions(p_node_id text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '28000';
  END IF;

  PERFORM private.spiral_lms_validate_mini_quiz_submission(v_uid, p_node_id);

  IF NOT private.spiral_lms_node_mini_quiz_ready(p_node_id) THEN
    RAISE EXCEPTION 'quiz_not_ready'
      USING ERRCODE = '22023';
  END IF;

  RETURN coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', q.id::text,
          'node_id', q.node_id,
          'sort_order', q.sort_order,
          'prompt', q.prompt,
          'question_type', q.question_type,
          'options', q.options
        )
        ORDER BY q.sort_order
      )
      FROM public.node_mini_quiz_questions q
      WHERE q.node_id = p_node_id
    ),
    '[]'::jsonb
  );
END;
$$;

ALTER FUNCTION public.get_node_mini_quiz_questions(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_node_mini_quiz_questions(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_node_mini_quiz_questions(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_mini_quiz(
  p_node_id text,
  p_client_attempt_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_normalized jsonb;
  v_grade record;
  v_core jsonb;
  v_existing public.user_attempts%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '28000';
  END IF;

  IF p_client_attempt_id IS NULL THEN
    RAISE EXCEPTION 'client_attempt_id_required'
      USING ERRCODE = '22023';
  END IF;

  PERFORM private.spiral_lms_validate_mini_quiz_submission(v_uid, p_node_id);

  v_normalized := private.spiral_lms_normalize_mini_quiz_answers(p_answers);

  SELECT * INTO v_existing
  FROM public.user_attempts ua
  WHERE ua.user_id = v_uid
    AND ua.client_attempt_id = p_client_attempt_id;

  IF FOUND THEN
    IF NOT private.spiral_lms_attempt_payload_matches(
      v_existing,
      p_node_id,
      'mini_quiz',
      NULL,
      v_existing.score,
      v_normalized
    ) THEN
      RAISE EXCEPTION 'idempotency_conflict'
        USING ERRCODE = '22023';
    END IF;

    v_core := private.spiral_lms_build_attempt_response(v_uid, v_existing)
      || jsonb_build_object('score', v_existing.score);

    RETURN private.spiral_lms_format_mini_quiz_response(
      v_uid,
      p_node_id,
      v_core,
      (
        SELECT g.results
        FROM private.spiral_lms_grade_mini_quiz(p_node_id, v_normalized) g
        LIMIT 1
      ),
      v_existing.passed
    );
  END IF;

  PERFORM pg_advisory_xact_lock(
    (hashtext(v_uid::text) & 2147483647),
    hashtext(p_node_id)
  );

  IF private.spiral_lms_mini_quiz_submissions_last_hour(v_uid, p_node_id) >= 5 THEN
    RAISE EXCEPTION 'rate_limited'
      USING ERRCODE = '22023';
  END IF;

  SELECT g.score, g.passed, g.results
  INTO v_grade
  FROM private.spiral_lms_grade_mini_quiz(p_node_id, v_normalized) g;

  v_core := private.spiral_lms_record_attempt_core(
    v_uid,
    p_node_id,
    'mini_quiz',
    p_client_attempt_id,
    NULL,
    v_grade.score,
    v_grade.passed,
    v_normalized,
    v_grade.results
  );

  RETURN private.spiral_lms_format_mini_quiz_response(
    v_uid,
    p_node_id,
    v_core,
    v_grade.results,
    v_grade.passed
  );
END;
$$;

ALTER FUNCTION public.submit_mini_quiz(text, uuid, jsonb) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.submit_mini_quiz(text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_mini_quiz(text, uuid, jsonb) TO authenticated;

COMMENT ON FUNCTION public.submit_mini_quiz(text, uuid, jsonb) IS
  'Grades spiral LMS mini-quiz answers server-side and records a mini_quiz attempt.';

-- ---------------------------------------------------------------------------
-- record_attempt: reject client-supplied mini_quiz scores (PR ④)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_attempt(
  p_node_id text,
  p_attempt_kind text,
  p_client_attempt_id uuid,
  p_content_slug text DEFAULT NULL,
  p_score numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_node public.nodes%ROWTYPE;
  v_score numeric;
  v_passed boolean := false;
  v_content_type text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated'
      USING ERRCODE = '28000';
  END IF;

  IF p_client_attempt_id IS NULL THEN
    RAISE EXCEPTION 'client_attempt_id_required'
      USING ERRCODE = '22023';
  END IF;

  IF p_attempt_kind NOT IN ('content_view', 'mini_quiz') THEN
    RAISE EXCEPTION 'invalid attempt_kind'
      USING ERRCODE = '22023';
  END IF;

  IF p_attempt_kind = 'mini_quiz' THEN
    RAISE EXCEPTION 'mini_quiz_use_submit_mini_quiz'
      USING ERRCODE = '22023';
  END IF;

  v_score := private.spiral_lms_validate_score(p_score);

  SELECT * INTO v_node
  FROM public.nodes
  WHERE id = p_node_id;

  IF NOT FOUND OR v_node.is_published IS NOT TRUE THEN
    RAISE EXCEPTION 'node_not_available'
      USING ERRCODE = '22023';
  END IF;

  IF v_node.opens_at IS NOT NULL AND v_node.opens_at > now() THEN
    RAISE EXCEPTION 'node_locked'
      USING ERRCODE = '22023';
  END IF;

  IF NOT private.spiral_lms_published_prerequisites_met(v_uid, p_node_id) THEN
    RAISE EXCEPTION 'prerequisites_not_met'
      USING ERRCODE = '22023';
  END IF;

  IF coalesce(v_node.unlock_config->>'z_level_gate', '') <> 'off'
     AND NOT private.spiral_lms_z_level_gate_met(v_uid, v_node.z_level) THEN
    RAISE EXCEPTION 'z_level_gate_locked'
      USING ERRCODE = '22023';
  END IF;

  IF p_content_slug IS NULL OR length(trim(p_content_slug)) = 0 THEN
    RAISE EXCEPTION 'content_slug_required'
      USING ERRCODE = '22023';
  END IF;

  SELECT nc.content_type INTO v_content_type
  FROM public.node_contents nc
  WHERE nc.node_id = p_node_id
    AND nc.content_slug = p_content_slug;

  IF v_content_type IS NULL THEN
    RAISE EXCEPTION 'content_not_linked_to_node'
      USING ERRCODE = '22023';
  END IF;

  IF NOT private.spiral_lms_content_publishable(p_content_slug) THEN
    RAISE EXCEPTION 'content_not_published'
      USING ERRCODE = '22023';
  END IF;

  v_passed := v_score = 100::numeric;

  RETURN private.spiral_lms_record_attempt_core(
    v_uid,
    p_node_id,
    'content_view',
    p_client_attempt_id,
    p_content_slug,
    v_score,
    v_passed,
    NULL
  );
END;
$$;

ALTER FUNCTION private.spiral_lms_normalize_mini_quiz_answers(jsonb) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_mini_quiz_answers_match(jsonb, jsonb) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_attempt_payload_matches(public.user_attempts, text, text, text, numeric, jsonb) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_grade_mini_quiz(text, jsonb) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_validate_mini_quiz_submission(uuid, text) OWNER TO postgres;

REVOKE ALL ON FUNCTION private.spiral_lms_normalize_mini_quiz_answers(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_answers_match(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_attempt_payload_matches(public.user_attempts, text, text, text, numeric, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_grade_mini_quiz(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_record_attempt_core(uuid, text, text, uuid, text, numeric, boolean, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_validate_mini_quiz_submission(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_node_mini_quiz_ready(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_mini_quiz_submissions_last_hour(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.spiral_lms_format_mini_quiz_response(uuid, text, jsonb, jsonb, boolean) FROM PUBLIC, anon, authenticated;

ALTER FUNCTION private.spiral_lms_node_mini_quiz_ready(text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_mini_quiz_submissions_last_hour(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_user_node_mini_quiz_ever_passed(uuid, text) OWNER TO postgres;
ALTER FUNCTION private.spiral_lms_format_mini_quiz_response(uuid, text, jsonb, jsonb, boolean) OWNER TO postgres;

-- Mini-quiz-only nodes + z-gate exclusions (PR ④ hardening)
CREATE OR REPLACE FUNCTION private.spiral_lms_z_level_gate_met(
  p_user_id uuid,
  p_z_level smallint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_z_level <= 1 THEN true
    ELSE NOT EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.is_published = true
        AND n.z_level = p_z_level - 1
        AND coalesce(n.unlock_config->>'exclude_from_z_gate', '') <> 'true'
        AND NOT EXISTS (
          SELECT 1
          FROM public.user_progress up
          WHERE up.user_id = p_user_id
            AND up.node_id = n.id
            AND up.status IN ('MASTERED', 'MAINTENANCE')
        )
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.spiral_lms_required_content_met(
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
    WHEN (
      SELECT count(*)::integer
      FROM public.node_contents nc
      WHERE nc.node_id = p_node_id
        AND nc.is_required = true
    ) > 0 THEN (
      SELECT bool_and(private.spiral_lms_slug_completed(p_user_id, nc.content_slug))
      FROM public.node_contents nc
      WHERE nc.node_id = p_node_id
        AND nc.is_required = true
    )
    WHEN (
      SELECT n.passing_score IS NOT NULL
      FROM public.nodes n
      WHERE n.id = p_node_id
    ) THEN private.spiral_lms_node_mini_quiz_ready(p_node_id)
    ELSE false
  END;
$$;

COMMIT;
