-- Phase 3: Delete D-2 duplicates + Tier B (変針点 CAS/TAS E6B-style) + broken/incomplete needs_review
-- Targets: 146 rows
--   D-2 duplicate_superseded: 3
--   Tier B (空中航法 変針点 + CAS/TAS): 141 (139 verified + 2 needs_review)
--   Broken data / incomplete stem: 2 (4be5ee98, 069dda53)
-- Report: artifacts/quiz_cbt_deletion_candidates_2026-05-28.md

BEGIN;

CREATE TEMP TABLE quiz_delete_targets (id uuid PRIMARY KEY) ON COMMIT DROP;

-- D-2 duplicates (superseded by verified canonical rows)
INSERT INTO quiz_delete_targets (id) VALUES
  ('43943690-c691-402c-8349-b62d780828bf'),
  ('9fe2eec5-d1c1-4264-afe1-cbc4ddccc08e'),
  ('f0e30596-4d06-406b-9286-7c91a1b3f59f');

-- Tier B: E6B-style 変針点 CAS/TAS (CBT: no flight computer required)
INSERT INTO quiz_delete_targets (id)
SELECT id
FROM public.unified_cpl_questions
WHERE main_subject = '空中航法'
  AND question_text ILIKE '%変針点%'
  AND (question_text ILIKE '%CAS%' OR question_text ILIKE '%TAS%');

-- Broken options / incomplete fuel stem (needs_review audit)
INSERT INTO quiz_delete_targets (id) VALUES
  ('4be5ee98-3e6a-4b7c-9e2e-b2552abfac7e'),
  ('069dda53-102c-432c-af1d-f9bef5933594')
ON CONFLICT (id) DO NOTHING;

-- 1) Detach from learning_test_mapping arrays
UPDATE public.learning_test_mapping m
SET
  unified_cpl_question_ids = (
    SELECT COALESCE(array_agg(x ORDER BY x), ARRAY[]::uuid[])
    FROM unnest(COALESCE(m.unified_cpl_question_ids, ARRAY[]::uuid[])) AS x
    WHERE x NOT IN (SELECT id FROM quiz_delete_targets)
  ),
  test_question_ids = (
    SELECT COALESCE(array_agg(t ORDER BY t), ARRAY[]::text[])
    FROM unnest(COALESCE(m.test_question_ids, ARRAY[]::text[])) AS t
    WHERE t NOT IN (SELECT id::text FROM quiz_delete_targets)
  ),
  updated_at = now()
WHERE m.unified_cpl_question_ids && (SELECT array_agg(id) FROM quiz_delete_targets)
   OR m.test_question_ids && (SELECT array_agg(id::text) FROM quiz_delete_targets);

-- 2) Remove dependent user rows
DELETE FROM public.user_unified_srs_status srs
WHERE srs.question_id IN (SELECT id FROM quiz_delete_targets);

DELETE FROM public.user_test_results utr
WHERE utr.unified_question_id IN (SELECT id FROM quiz_delete_targets)
   OR utr.question_id IN (SELECT id::text FROM quiz_delete_targets);

DELETE FROM public.question_issue_reports r
WHERE r.question_id IN (SELECT id FROM quiz_delete_targets);

-- 3) Delete questions
DELETE FROM public.unified_cpl_questions q
WHERE q.id IN (SELECT id FROM quiz_delete_targets);

-- Verification
SELECT
  (SELECT count(*) FROM quiz_delete_targets) AS target_count,
  (SELECT count(*) FROM public.unified_cpl_questions u
   WHERE u.id IN (SELECT id FROM quiz_delete_targets)) AS remaining_deleted_ids,
  (SELECT count(*) FROM public.unified_cpl_questions
   WHERE verification_status = 'verified') AS verified_total,
  (SELECT count(*) FROM public.unified_cpl_questions
   WHERE verification_status = 'needs_review') AS needs_review_total;

COMMIT;
