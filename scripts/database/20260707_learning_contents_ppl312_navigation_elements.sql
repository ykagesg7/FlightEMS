-- PPL Subject 3 Phase 1 第2本 — PPL-3-1-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-1-2_NavigationElementsAndAltitude',
  '【空中航法】航法要素と高度：向き・速度・高さの「三兄弟」と暗算の極意',
  'PPL',
  '空中航法',
  '針路と航跡、IAS/TAS/GS、そして4つの高度。空の「三兄弟」の定義を整理し、コックピットで3秒で計算をキメる「TAS/60の法則」の極意をハックする。',
  302,
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
