-- PPL Subject 3 Phase 1 第4本 — PPL-3-1-4 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-1-4_WindTriangleAndFlightComputer',
  '【空中航法】風力三角形と航法計算：風を第三の矢印として足す暗算ハック',
  'PPL',
  '空中航法',
  '飛んでいる最中に計算盤を回す余裕などない！風に流される恐怖と、CBT試験でも実機でも最強の武器になるプロの暗算術「時計の文字盤の法則」を伝授する。',
  304,
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
