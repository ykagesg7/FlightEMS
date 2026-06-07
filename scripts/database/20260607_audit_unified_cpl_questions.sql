-- Mechanical quality audit for unified_cpl_questions (verified rows)
-- Run via Supabase MCP execute_sql; save output to artifacts/quiz_quality_audit_YYYY-MM-DD.md

-- A1: invalid correct_answer
SELECT 'A1_invalid_correct_answer' AS check_id, id, main_subject, sub_subject, correct_answer
FROM public.unified_cpl_questions
WHERE verification_status = 'verified'
  AND (correct_answer IS NULL OR correct_answer NOT BETWEEN 1 AND 4);

-- A2: options array length != 4
SELECT 'A2_options_length' AS check_id, id, main_subject, sub_subject,
  jsonb_array_length(options::jsonb) AS options_len
FROM public.unified_cpl_questions
WHERE verification_status = 'verified'
  AND (
    options IS NULL
    OR jsonb_typeof(options::jsonb) <> 'array'
    OR jsonb_array_length(options::jsonb) <> 4
  );

-- A3: missing explanation
SELECT 'A3_missing_explanation' AS check_id, id, main_subject, sub_subject
FROM public.unified_cpl_questions
WHERE verification_status = 'verified'
  AND (explanation IS NULL OR btrim(explanation) = '');

-- A4: duplicate question_text within subject cluster
SELECT 'A4_duplicate_text' AS check_id,
  main_subject, sub_subject, question_text, count(*) AS dup_count,
  array_agg(id ORDER BY created_at) AS question_ids
FROM public.unified_cpl_questions
WHERE verification_status = 'verified'
GROUP BY main_subject, sub_subject, question_text, correct_answer
HAVING count(*) > 1;

-- A5: correct_answer out of options range (1-based index)
SELECT 'A5_correct_answer_oob' AS check_id, u.id, u.main_subject, u.correct_answer,
  jsonb_array_length(u.options::jsonb) AS options_len
FROM public.unified_cpl_questions u
WHERE u.verification_status = 'verified'
  AND u.options IS NOT NULL
  AND jsonb_typeof(u.options::jsonb) = 'array'
  AND u.correct_answer > jsonb_array_length(u.options::jsonb);

-- A6: questions with open user reports (requires question_issue_reports)
SELECT 'A6_open_reports' AS check_id,
  s.question_id,
  s.open_count,
  s.last_reported_at,
  u.main_subject,
  u.sub_subject,
  left(u.question_text, 120) AS question_preview
FROM public.v_question_report_summary s
JOIN public.unified_cpl_questions u ON u.id = s.question_id
WHERE s.open_count >= 1
ORDER BY s.open_count DESC, s.last_reported_at DESC;

-- Summary counts
SELECT 'summary' AS check_id,
  (SELECT count(*) FROM public.unified_cpl_questions WHERE verification_status = 'verified') AS verified_total,
  (SELECT count(*) FROM public.unified_cpl_questions WHERE verification_status = 'verified'
    AND (correct_answer IS NULL OR correct_answer NOT BETWEEN 1 AND 4)) AS a1_count,
  (SELECT count(*) FROM public.unified_cpl_questions WHERE verification_status = 'verified'
    AND (options IS NULL OR jsonb_typeof(options::jsonb) <> 'array'
      OR jsonb_array_length(options::jsonb) <> 4)) AS a2_count,
  (SELECT count(*) FROM public.unified_cpl_questions WHERE verification_status = 'verified'
    AND (explanation IS NULL OR btrim(explanation) = '')) AS a3_count;
