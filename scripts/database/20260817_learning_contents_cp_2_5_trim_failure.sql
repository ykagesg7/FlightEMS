-- CP series Season 2 ep.5: CP-2-5_TrimFailure
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-5_TrimFailure',
  '【操縦】第8話：手放すな、retrimしろ ～模擬トリム故障～',
  '操縦',
  '曲技飛行',
  '手放したスティックはトリム速度を探す。300超でtrim後retrimせず減速、240以下でgear&flapsは後圧。go-aroundは前圧。終わったらretrim。数字はT-38枠。',
  618,
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
