-- パイロット: 航空工学「空力の基礎理論」系 25 問に PPL を付与し、PPL 記事 1 本と learning_test_mapping を追加。
-- 前提: 20260324_add_unified_cpl_applicable_exams.sql 適用済み。
-- 本番では MCP / SQL Editor で実行済みの場合はスキップ可。

BEGIN;

WITH tagged AS (
  SELECT id FROM unified_cpl_questions
  WHERE main_subject = '航空工学'
    AND verification_status = 'verified'
    AND sub_subject IS NOT NULL
    AND sub_subject LIKE '%空力の基礎理論%'
  LIMIT 25
)
UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL','CPL']::text[],
    updated_at = COALESCE(updated_at, now())
FROM tagged t
WHERE u.id = t.id;

INSERT INTO learning_test_mapping (
  learning_content_id,
  content_title,
  content_category,
  test_question_ids,
  unified_cpl_question_ids,
  topic_category,
  subject_area,
  mapping_source,
  verification_status
)
SELECT
  'PPL-1-1-1_TemperatureBasics',
  lc.title,
  lc.category,
  (SELECT ARRAY_AGG(id::text) FROM (
    SELECT id FROM unified_cpl_questions
    WHERE applicable_exams @> ARRAY['PPL']::text[]
      AND main_subject = '航空工学'
      AND sub_subject LIKE '%空力の基礎理論%'
    LIMIT 25
  ) s),
  (SELECT ARRAY_AGG(id) FROM (
    SELECT id FROM unified_cpl_questions
    WHERE applicable_exams @> ARRAY['PPL']::text[]
      AND main_subject = '航空工学'
      AND sub_subject LIKE '%空力の基礎理論%'
    LIMIT 25
  ) s2),
  '航空工学',
  '航空工学',
  'pilot_applicable_exams',
  'verified'
FROM learning_contents lc
WHERE lc.id = 'PPL-1-1-1_TemperatureBasics'
  AND NOT EXISTS (
    SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = 'PPL-1-1-1_TemperatureBasics'
  )
LIMIT 1;

COMMIT;
