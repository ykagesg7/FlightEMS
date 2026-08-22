-- CP series Season 5 ep.4: CP-5-4_BarrelRoll
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-4_BarrelRoll',
  '【操縦】第17話：機首は一点の周りを円で回せ ～Barrel Roll～',
  '操縦',
  '曲技飛行',
  'Barrel Rollは協調ロールで機首が一点の周りを円で回る。全行程positive G。進入は30-45度オフセットから。400 KIAS / 95% rpm（T-38の場合）。',
  627,
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
