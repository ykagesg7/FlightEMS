-- CP series Season 5 ep.3: CP-5-3_LazyEight
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-5-3_LazyEight',
  '【操縦】第16話：左右対称の8を描け ～Lazy Eight～',
  '操縦',
  '曲技飛行',
  'Lazy Eightはパラメータが常に変わる。滑らかで左右対称につなげ。45度で最大ピッチ、90度で地平線通過、180度で水平かつ進入速度。進入は350 KIAS / 95% rpm（T-38の場合）。',
  626,
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
