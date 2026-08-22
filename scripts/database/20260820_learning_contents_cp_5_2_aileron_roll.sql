-- CP series Season 5 ep.2: CP-5-2_AileronRoll
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-2_AileronRoll',
  '【操縦】第15話：鼻を一点に釘付けするな ～Aileron roll～',
  '操縦',
  '曲技飛行',
  'エルロンロールは任意の速度・ピッチから滑らかに回せ。鼻を一点に釘付けするな。終盤は舵圧を緩めて水平の行き過ぎを防ぐ。T-38はロールレートが極めて高い。',
  625,
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
