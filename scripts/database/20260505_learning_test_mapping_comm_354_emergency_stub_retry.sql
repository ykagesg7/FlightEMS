-- 航空通信 3.5.4：緊急・遭難・救難（sub_subject 束ね）スタブ既定マッピングの再適用／新環境投入用。
-- 冪等: NOT EXISTS (learning_content_id)。
-- 本番ですでに 20260410_cpl_stub_lessons_contents_and_mapping.sql が当たっている場合は何もしない。
-- mapping_source は追跡しやすいよう日付別名を付与。

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
  lc.id,
  lc.title,
  lc.category,
  (SELECT COALESCE(array_agg(q.id::text ORDER BY q.id), ARRAY[]::text[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (
       q.main_subject = '航空通信'
       AND (
         q.sub_subject ILIKE '%緊急%'
         OR q.sub_subject ILIKE '%遭難%'
         OR q.sub_subject ILIKE '%救難%'
       )
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND (
       q.main_subject = '航空通信'
       AND (
         q.sub_subject ILIKE '%緊急%'
         OR q.sub_subject ILIKE '%遭難%'
         OR q.sub_subject ILIKE '%救難%'
       )
     )),
  '航空通信',
  '航空通信',
  'may_plan_20260505_retry_comm_354',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.5.4_EmergencyProcedures'
  AND NOT EXISTS (SELECT 1 FROM learning_test_mapping m WHERE m.learning_content_id = lc.id)
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空通信'
      AND (
        q.sub_subject ILIKE '%緊急%'
        OR q.sub_subject ILIKE '%遭難%'
        OR q.sub_subject ILIKE '%救難%'
      )
    LIMIT 1
  );
