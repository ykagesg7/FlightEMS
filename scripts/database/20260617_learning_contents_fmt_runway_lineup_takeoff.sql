-- USAF Formation Flying series ep.2: FMT-1-2_RunwayLineupTakeoff
-- category: 操縦 (article hub). Idempotent upsert.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-2_RunwayLineupTakeoff',
  '【操縦】第2話：滑走路のシンクロ ～的からの脱出と周辺視野～',
  '操縦',
  '編隊飛行',
  '滑走路整列と編隊離陸をハック。地上の「的」から最速で脱出し、周辺視野でリーダー機を捉え、極限の信頼を体得する第2話。',
  602,
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
