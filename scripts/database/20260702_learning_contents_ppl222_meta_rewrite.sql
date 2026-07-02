-- W27 2026-07-02: PPL-2-2-2 深文化リライト — learning_contents title/description 同期
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

UPDATE learning_contents
SET
  title = '【航空気象】気団と前線：天気図の裏に潜む「3次元の滑り台」をハックせよ',
  description = '4大気団・温暖/寒冷前線の3次元構造・前線通過時の風向変化。PPL Subject 2 ブロック B 第2本（深文化版）。',
  updated_at = NOW()
WHERE id = 'PPL-2-2-2_AirMassesAndFronts';
