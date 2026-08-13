-- USAF Formation Flying series ep.8: FMT-1-8_Rejoin
-- Stock: is_published false until articlePublishSchedule (not W34).

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'FMT-1-8_Rejoin',
  '【操縦】第8話：合流ば救うな ～Pitchout / Rejoin / Overshoot / Breakout～',
  '操縦',
  '編隊飛行',
  '合流を救うな。Pitchoutで間隔、POM下50 ft、overtakeはGで消すな。Overshootは早く。Breakoutは4条件。Area 79はuncontrolled/衝突。',
  608,
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
