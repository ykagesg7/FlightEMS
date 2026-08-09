-- W33「訓練の当たり前」学び編（4.2.1–4.2.5）
-- Drip: is_published starts false; article-publish-sync flips by publishDate (JST).
INSERT INTO learning_contents (
  id, title, category, sub_category, description,
  order_index, parent_id, content_type, is_published, updated_at
) VALUES
(
  '4.2.1_TurnFeedbackIntoAction',
  '指摘は、行動に落とせ',
  'メンタリティー',
  '訓練作法',
  '同じ指摘が戻ってくるのは気合不足ではなく、行動言語に落ちていないから。',
  206, NULL, 'mdx', false, NOW()
),
(
  '4.2.2_PutAFrameOnFailure',
  '失敗に、型を置け',
  'メンタリティー',
  '訓練作法',
  '「失敗から学べ」と言われて失敗したら怒られた矛盾で固まらない。何が／なぜ／次の3点デブリーフ。',
  207, NULL, 'mdx', false, NOW()
),
(
  '4.2.3_TakeTheGainFromFeedback',
  '指摘のゲインを取れ',
  'メンタリティー',
  '訓練作法',
  '指摘をダメージ回避で聞くな。次に使える一点（ゲイン）を取りにいけ。',
  208, NULL, 'mdx', false, NOW()
),
(
  '4.2.4_YesHasAShortShelfLife',
  '「はい」は、賞味期限が短い',
  'メンタリティー',
  '訓練作法',
  '口だけの素直さは腐る。翌週の行動が変わっていることだけが素直。',
  209, NULL, 'mdx', false, NOW()
),
(
  '4.2.5_ThinkingStamina',
  '地頭より、思考体力',
  'メンタリティー',
  '訓練作法',
  '一発の切れ味で勝負するな。赤入れ後にもう一周考えられる持久力が地頭の代わりになる。',
  210, NULL, 'mdx', false, NOW()
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
