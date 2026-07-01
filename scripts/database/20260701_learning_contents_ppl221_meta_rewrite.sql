-- W27 2026-07-01: PPL-2-2-1 深文化リライト — learning_contents title/description 同期
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

UPDATE learning_contents
SET
  title = '【航空気象】風の観測と通報：地上の「矢印」と「真・磁」の騙し合い',
  description = '風向・真磁の使い分け・METAR 風グループ・吹き流し。PPL Subject 2 ブロック B 第1本（深文化版）。',
  updated_at = NOW()
WHERE id = 'PPL-2-2-1_WindObservationBasics';
