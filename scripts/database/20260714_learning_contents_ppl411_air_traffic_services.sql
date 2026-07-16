-- PPL Subject 4 Phase 1 第1本 — PPL-4-1-1 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-1-1_AirTrafficServicesOverview',
  '【航空通信】航空交通業務の概要：管制・情報・警急の三本柱',
  'PPL',
  '航空通信',
  '航空交通業務（ATS）の三本柱 — 管制・飛行情報・警急。指示 vs 助言の型を正本とする。Subject 4 全記事の入口。',
  401,
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
