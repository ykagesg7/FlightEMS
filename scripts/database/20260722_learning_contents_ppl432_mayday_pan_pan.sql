-- PPL Subject 4 Phase 1 第8本 — PPL-4-3-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-3-2_MaydayPanPanBasics',
  '【航空通信】MAYDAY と PAN PAN：緊急・遭難通信の基礎',
  'PPL',
  '航空通信',
  'MAYDAY（遭難）と PAN PAN（緊急）の重大度の違い、緊急通信の基本構成。Subject 4 Phase 1 の締め。',
  408,
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
