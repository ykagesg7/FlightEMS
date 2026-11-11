-- Instrument-Flying IF-1-4_Attitude_Turns（publishedAt 2026-12-11）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true で投入。
-- Sibling: 20261107_learning_contents_if_1_3_imc_scan.sql（order_index 703）

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'IF-1-4_Attitude_Turns',
  '【操縦】計器飛行第4話：姿勢指示とターンの型',
  '操縦',
  '計器飛行',
  '日曜の心構えで OODA に向き合い、水曜にジャイロの理屈を確かめたら、金曜はいよいよ実技の本番たい。雲中で針路を変える旋回でも、維持すべきピッチ姿勢そのものは変わらん。だがロール中はピッチを支える操縦桿の力が刻々と変わる。バンクに目を奪われてピッチを落とすな、戻しで跳ね上げるな。AIから目を離さず型を通す実技の真髄を叩き込むばい。',
  704,
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
