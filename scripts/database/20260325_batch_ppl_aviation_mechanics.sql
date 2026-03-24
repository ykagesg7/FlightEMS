-- Batch 2: 航空工学「航空力学」verified 全件に PPL+CPL を付与（既に PPL 付きは変更しない）
-- 前提: 20260324_add_unified_cpl_applicable_exams.sql 適用済み
-- 監査: docs/db/APPLICABLE_EXAMS_PILOT.md の「監査クエリ」を実行して付与前後件数を記録すること

BEGIN;

UPDATE unified_cpl_questions u
SET applicable_exams = ARRAY['PPL', 'CPL']::text[],
  updated_at = COALESCE(u.updated_at, now())
WHERE u.verification_status = 'verified'
  AND u.main_subject = '航空工学'
  AND u.sub_subject = '航空力学'
  AND NOT (u.applicable_exams @> ARRAY['PPL']::text[]);

COMMIT;
