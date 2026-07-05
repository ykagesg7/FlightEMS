-- W27 2026-07-05: PPL-2-3-1 深文化リライト — learning_contents title/description 同期
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

UPDATE learning_contents
SET
  title = '【航空気象】飛行気象障害の基礎：空の地雷原と「諦める勇気」',
  description = '乱気流・CB・着氷・視程障害・火山灰とエアマンシップ。PPL Subject 2 ブロック C 第1本（深文化版）。',
  updated_at = NOW()
WHERE id = 'PPL-2-3-1_FlightWeatherHazardsBasics';
