-- PPL Subject 4 Phase 1 第6本 — PPL-4-2-4 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-4-2-4_FlightPlanFilingBasics',
  '【航空通信】飛行計画の提出：ファイル・変更・クローズ',
  'PPL',
  '航空通信',
  '飛行計画の提出・変更・クローズ。航法 PPL-3-1-5 の計画内容と通信側手順を接続。Subject 3×4 の橋記事。',
  406,
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
