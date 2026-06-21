-- W24 2026: 航空工学「空力の基礎理論」未マッピングクラスタ → `3.2.7_LiftAndDrag` への learning_test_mapping 追補。
-- Tier A: 空力の基礎理論/力学の基礎・対気速度・操縦性 等（docs/Article_Coverage_Backlog.md §6）。
-- 冪等: ON CONFLICT (learning_content_id, topic_category) DO UPDATE。

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
     AND q.main_subject = '航空工学'
     AND q.sub_subject IN (
       '空力の基礎理論/力学の基礎',
       '空力の基礎理論/対気速度',
       '空力の基礎理論/操縦性'
     )),
  (SELECT COALESCE(array_agg(q.id ORDER BY q.id), ARRAY[]::uuid[])
   FROM unified_cpl_questions q
   WHERE q.verification_status = 'verified'
     AND q.main_subject = '航空工学'
     AND q.sub_subject IN (
       '空力の基礎理論/力学の基礎',
       '空力の基礎理論/対気速度',
       '空力の基礎理論/操縦性'
     )),
  '航空工学/空力基礎理論_w24',
  '空力の基礎理論',
  'w24_20260606_aero_lift_drag_clusters',
  'verified'
FROM learning_contents lc
WHERE lc.id = '3.2.7_LiftAndDrag'
  AND EXISTS (
    SELECT 1
    FROM unified_cpl_questions q
    WHERE q.verification_status = 'verified'
      AND q.main_subject = '航空工学'
      AND q.sub_subject IN (
        '空力の基礎理論/力学の基礎',
        '空力の基礎理論/対気速度',
        '空力の基礎理論/操縦性'
      )
    LIMIT 1
  )
ON CONFLICT (learning_content_id, topic_category) DO UPDATE SET
  test_question_ids = EXCLUDED.test_question_ids,
  unified_cpl_question_ids = EXCLUDED.unified_cpl_question_ids,
  content_title = EXCLUDED.content_title,
  content_category = EXCLUDED.content_category,
  mapping_source = EXCLUDED.mapping_source,
  updated_at = now();
