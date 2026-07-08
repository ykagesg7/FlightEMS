-- PPL Subject 3 Phase 1 第3本 — PPL-3-1-3 公開
-- Apply: Supabase MCP execute_sql (project_id = fstynltdfdetpyvbrswr)

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'PPL-3-1-3_AeronauticalChartsBasics',
  '【空中航法】航空図の基礎：地図の「暗号」と、Google Mapを使った3D地形ハック術',
  'PPL',
  '空中航法',
  '丸い地球をどうやって平らな紙に広げるのか？ 航空図の主役「ランベルト正角円錐図法」の秘密と、地上の鉄塔や滑走路長を読み解く「地図の暗号解読」をハックする。',
  303,
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
