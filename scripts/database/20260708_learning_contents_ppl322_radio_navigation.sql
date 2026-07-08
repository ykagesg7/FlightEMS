-- PPL Subject 3 Phase 2 第2本 — PPL-3-2-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-2-2_RadioNavigationOverview',
  '【空中航法】無線航法の概要：電波で「線」を引く、見えない糸と「救いの灯り」',
  'PPL',
  '空中航法',
  '雲の中で地上の景色が見えなくなったらどうする？ VOR・DME・NDB・ILS。4つの無線標識（NAVAID）の役割を、実際の飛行場面（フェーズ）とリンクさせて完全ハックする。',
  307,
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
