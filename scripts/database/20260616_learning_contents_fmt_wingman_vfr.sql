-- USAF Formation Flying series ep.1: FMT-1-1_WingmanVFR
-- category: 操縦 (article hub). Idempotent upsert.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-1_WingmanVFR',
  '【操縦】第1話：ウイングマンの魂 ～V.F.Rの血の掟～',
  '操縦',
  '編隊飛行',
  '眠い日本語教程を焼却し、USAF T-38 教範 AFMAN 11-2T-38 から「Visual・Formation・Radar」の優先順位を体得する。金魚のフンから最強のウイングマンへ。',
  601,
  NULL,
  'text',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
