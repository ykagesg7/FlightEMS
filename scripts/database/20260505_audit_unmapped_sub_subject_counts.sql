-- 監査のみ（読み取り）：未マッピング設問の sub_subject 集計（Article_Coverage_Backlog §5.2 と同型）
-- 月次サイクル: Supabase MCP execute_sql で結果を確認し、`learning_test_mapping` への投入方針を決める。
-- INSERT / UPDATE は行わない。

WITH mapped AS (
  SELECT DISTINCT x::text AS qid
  FROM learning_test_mapping, LATERAL unnest(unified_cpl_question_ids) AS x
  WHERE unified_cpl_question_ids IS NOT NULL
  UNION
  SELECT DISTINCT y::text AS qid
  FROM learning_test_mapping, LATERAL unnest(test_question_ids) AS y
  WHERE test_question_ids IS NOT NULL
)
SELECT
  u.main_subject,
  u.sub_subject,
  COUNT(*)::int AS unmapped_questions
FROM unified_cpl_questions u
LEFT JOIN mapped m ON m.qid = u.id::text
WHERE u.verification_status = 'verified'
  AND m.qid IS NULL
GROUP BY u.main_subject, u.sub_subject
ORDER BY unmapped_questions DESC;
