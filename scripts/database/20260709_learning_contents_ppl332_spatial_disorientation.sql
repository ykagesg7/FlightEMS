-- PPL Subject 3 Phase 1 第9本（締め）— PPL-3-3-2 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-3-2_SpatialDisorientationBasics',
  '【空中航法】空間識失調の基礎：足元に死神が潜む「気づけないウソ」の恐怖',
  'PPL',
  '空中航法',
  '自分の感覚が、平気でウソをつく。夜間や雲中（IMC）の飛行。空間識失調（バーティゴ）の罠と、本能をねじ伏せて計器を信じ抜く生還プロトコル。',
  309,
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
