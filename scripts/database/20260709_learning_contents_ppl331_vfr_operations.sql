-- PPL Subject 3 Phase 1 第8本 — PPL-3-3-1 公開
-- mapping: 法規 PPL-5-4-1 に分担（本記事は learning_test_mapping 行なし）
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-3-1_VfrOperationsAndAirspace',
  '【空中航法】VFR 運航と空域：見えない地雷を避ける「目視と交信」のサバイバル術',
  'PPL',
  '空中航法',
  'VFRは「自己責任」のフライトたい。雲の向こうから飛び出す他機と地面の恐怖。最低気象条件（VMC）の数字の意味と、空域の境界線をハックする。',
  308,
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
