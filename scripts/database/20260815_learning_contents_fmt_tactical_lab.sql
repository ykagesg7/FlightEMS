-- USAF Formation Flying series ep.9: FMT-1-9_TacticalLAB
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-9_TacticalLAB',
  '【操縦】第9話：見せ場じゃない ～LAB / Tactical Turns～',
  '操縦',
  '編隊飛行',
  '戦術隊形は等しい見張り。LABは4,000–6,000 ft・strive 0°。合図なしはdelayed 90。2番機は上。Area 81は位置喪失/deconflict。',
  609,
  NULL,
  'text',
  false,
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
