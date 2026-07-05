-- W27 2026-07-06: PPL-2-3-2 深文化リライト — learning_contents title/description 同期
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

UPDATE learning_contents
SET
  title = '【航空気象】METAR・TAF・気象通報の読み方：空港の「今」と「予報」のハック術',
  description = 'METAR/TAF/SPECI、5大グループ、JST変換と腹案。PPL Subject 2 Phase 1 完走（深文化版）。',
  updated_at = NOW()
WHERE id = 'PPL-2-3-2_MetarTafAndWeatherReports';
