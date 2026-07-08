-- Phase 2: Delete D-1 (obsolete Art.152) + Tier A (CBT mismatch) questions
-- Targets: 30 rows (2 D-1 + 28 Tier A)
-- Report: artifacts/quiz_cbt_deletion_candidates_2026-05-28.md

BEGIN;

CREATE TEMP TABLE quiz_delete_targets (id uuid PRIMARY KEY) ON COMMIT DROP;

INSERT INTO quiz_delete_targets (id) VALUES
  -- D-1 obsolete 特定救急用具
  ('57977f21-b0d7-4376-ae08-2302bc392c1a'),
  ('fe22181a-26cd-4dbb-9bd1-4e51b6647a12'),
  -- A-1 flight computer
  ('23085074-8c1f-43c9-b7b8-18b5abb6a058'),
  ('317728de-368f-40fc-a739-b16752278957'),
  ('69bc6a6b-bdf4-4e3b-ac00-a553ac1b13c7'),
  ('88111e0a-d9d4-41c9-bcb7-2184f7bf88a3'),
  ('d7c2cebc-e04e-4774-8cec-e2d2435f0ab6'),
  -- A-2 non-four-options
  ('96ba47fc-ddfc-4730-9836-2093e8549e28'),
  ('652b3a72-0b04-416a-b2cd-4b21c1455b97'),
  ('5482dce0-be85-43b4-9ffb-79adac6e1d16'),
  ('b55d3abd-9d4c-4c8c-a39e-bc6f7ae4db7e'),
  ('7e7e6f26-7895-472e-871a-9df2bc946e52'),
  ('8a45911a-1829-46e6-b7f4-34798d0b3083'),
  -- A-3 essay stem (includes duplicate pairs — all removed)
  ('0d7e147b-a3fe-4344-9fb5-18225ebe9899'),
  ('1dd8d8d2-1f83-47f3-b8ce-17624cbc8ec7'),
  ('304ba53f-a86c-4806-a948-8a7f9e8edcf6'),
  ('88841c39-f174-4a14-ac43-1ea857c82e46'),
  ('8f684ce4-d289-43ca-9dd2-deb44b1ac6b8'),
  ('96b9fa47-0b29-48ea-b565-e619986da711'),
  ('98cc55f9-b9f8-4306-9ca4-d985c5404103'),
  ('a004190a-8b55-4bf6-a272-28552337b3af'),
  ('a633206a-ca5a-40ad-a568-fa5b2abb67be'),
  ('b2415d46-5d84-4722-a5af-b3f23532d222'),
  ('d676b42f-8b8e-4068-858b-5989485e31d1'),
  ('294ba61c-3bf2-427a-a767-8c2b9888dfc3'),
  ('57f3068c-28a3-4cc0-8d07-1ad0eeae887d'),
  ('11ab1c75-91e2-48dc-9261-32136c5b851c'),
  ('7f070367-23a9-4345-840c-4a66ff441a7f'),
  ('a2fa6667-d8d3-4d0d-b439-907f9a4ca671'),
  ('a8936a54-1536-44ec-b846-4d75e9e4946b');

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
