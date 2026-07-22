-- PPL Subject 4 Phase 1 第7本 — PPL-4-3-1 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-3-1_CommFailureAndLightSignals',
  '【航空通信】無線故障と可視信号：ライトガンと三角形',
  'PPL',
  '航空通信',
  '無線故障時の基本対応、ライトガン（可視信号）の色と意味、三角形手順。Mayday との住み分けは PPL-4-3-2 へ。',
  407,
  NULL,
  'text',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
