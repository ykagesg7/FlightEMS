-- CP series Season 5 ep.8: CP-5-8_Cloverleaf
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-8_Cloverleaf',
  '【操縦】第21話：同じ向きに4枚の葉を描け ～Cloverleaf～',
  '操縦',
  '曲技飛行',
  'Cloverleafは同じ葉を4つ同方向に連続。各進入方位は前の葉から90度。第1葉は最寄り境界へ。進入は450 KIAS / MIL（T-38の場合）。',
  631,
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
