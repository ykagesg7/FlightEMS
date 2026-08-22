-- CP series Season 2 ep.3: CP-2-3_RollAuthority
-- Stock: is_published false until articlePublishSchedule.

INSERT INTO learning_contents (id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at)
VALUES (
  'CP-2-3_RollAuthority',
  '【操縦】第6話：効く面でロールしろ ～ラダーとエルロン～',
  '操縦',
  '曲技飛行',
  '同じフル舵でもAOAが変わればロールは出ない。効きが悪いから今の舵を足すな。高AOAはラダー、低AOAはエルロン。Deep stall中のラダーロールは別課目。数字はT-38枠。学習記事であり実機手順ではない。',
  616,
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
