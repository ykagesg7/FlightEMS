-- W27 2026-07-04: PPL-2-2-3 深文化リライト — learning_contents title/description 同期
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

UPDATE learning_contents
SET
  title = '【航空気象】高気圧・低気圧と日本の天気：避難飛行と「危険半円」のハック術',
  description = '高低気圧の風の回り、温帯低気圧・西高東低、台風の危険半円と避難飛行。PPL Subject 2 ブロック B 第3本（深文化版）。',
  updated_at = NOW()
WHERE id = 'PPL-2-2-3_PressureSystemsAndJapanWeather';
