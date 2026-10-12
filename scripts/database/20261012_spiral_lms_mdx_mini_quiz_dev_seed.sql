-- Spiral LMS PR ④: optional dev / integration sample (1 node, 1 question).
-- Not part of L1/L2 production seed. Safe to apply in CI and local Docker only.

BEGIN;

INSERT INTO public.nodes (
  id,
  title,
  quadrant,
  z_level,
  sort_order,
  passing_score,
  unlock_config,
  is_published,
  opens_at
)
VALUES (
  'SPIRAL-DEV-MINI',
  '螺旋 LMS ミニテスト（開発サンプル）',
  1,
  1,
  99,
  100,
  '{"z_level_gate":"off"}'::jsonb,
  true,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  passing_score = EXCLUDED.passing_score,
  unlock_config = EXCLUDED.unlock_config,
  is_published = EXCLUDED.is_published,
  updated_at = now();

DELETE FROM public.node_mini_quiz_questions
WHERE node_id = 'SPIRAL-DEV-MINI';

WITH inserted AS (
  INSERT INTO public.node_mini_quiz_questions (
    id,
    node_id,
    sort_order,
    prompt,
    question_type,
    options
  )
  VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'SPIRAL-DEV-MINI',
    1,
    '（サンプル）VFR 飛行の最低気象条件を誰が定めるか。',
    'single',
    '[
      {"id": "a", "text": "運輸省（国土交通省）"},
      {"id": "b", "text": "パイロット個人のみ"},
      {"id": "c", "text": "航空会社のみ"}
    ]'::jsonb
  )
  RETURNING id
)
INSERT INTO private.node_mini_quiz_answer_keys (question_id, correct_option_ids)
SELECT id, ARRAY['a']::text[]
FROM inserted
ON CONFLICT (question_id) DO UPDATE SET
  correct_option_ids = EXCLUDED.correct_option_ids;

COMMIT;
