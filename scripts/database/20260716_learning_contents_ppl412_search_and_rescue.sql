-- PPL Subject 4 Phase 1 第2本 — PPL-4-1-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-1-2_SearchAndRescueBasics',
  '【航空通信】捜索救難の基礎：121.5 MHz と命を繋ぐ「ガード」の精神',
  'PPL',
  '航空通信',
  '121.5 MHz（救難周波数）、救難信号、捜索救難体制。警急業務から救難ネットワークへのバトン。緊急通信の前に「誰が・何を探すか」の型をハックする。',
  402,
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
