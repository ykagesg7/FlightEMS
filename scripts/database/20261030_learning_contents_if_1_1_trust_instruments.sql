-- Instrument-Flying IF-1-1_TrustInstruments（即公開）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true で投入。
-- Sibling pattern: 20260616_learning_contents_fmt_wingman_vfr.sql（category=操縦）

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'IF-1-1_TrustInstruments',
  '【操縦】計器飛行第1話：計器を信じろ ～AIF / Cross-check～',
  '操縦',
  '計器飛行',
  '外景が乳白色に呑まれたとき、頼るべきは己の平衡感覚ではなく計器盤たい。AIFの思想とCross-checkの視線の型を身につけ、計器飛行の第一歩を踏み出すばい。',
  701,
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

COMMIT;
