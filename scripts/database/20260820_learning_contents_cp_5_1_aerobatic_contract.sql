-- CP series Season 5 ep.1: CP-5-1_AerobaticContract
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-1_AerobaticContract',
  '【操縦】第14話：図形の前に契約を結べ ～Aerobatic contract～',
  '操縦',
  '曲技飛行',
  '曲技は図形の前に契約。smoothに飛べ。垂直面は10,000 ft以上を計画。10°ごとに10 ktおよび/または500 ftのリード。箱は開始から完了。数字はT-38枠。',
  624,
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
