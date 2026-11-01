-- Instrument-Flying IF-1-2_PartialPanel（publishedAt 2026-11-27）。
-- 本番未適用。Approve 後に適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true で投入。
-- Sibling: 20261030_learning_contents_if_1_1_trust_instruments.sql（order_index 701）

BEGIN;

INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
)
VALUES
(
  'IF-1-2_PartialPanel',
  '【操縦】計器飛行第2話：欠けても型を守れ ～部分パネルと異常姿勢の入口～',
  '操縦',
  '計器飛行',
  '頼みの主計器が不作動になったとき、あるいは激しい気流で姿勢が崩れたとき、身体の錯覚にすがるな。部分パネルでの計器再構築と異常姿勢回復の初動の型を叩き込むばい。',
  702,
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
