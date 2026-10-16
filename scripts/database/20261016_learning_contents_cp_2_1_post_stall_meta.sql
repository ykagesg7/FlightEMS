-- CP-2-1: T-4 post-stall rewrite — sync learning_contents title/description with MDX meta.
-- Do not run from CI; apply manually after PR merge when catalog should match published article.

UPDATE learning_contents
SET
  title = '【操縦】第4話：ポストストール ～Post-stall～',
  description = 'ポストストールは、失速の先で機体がどう暴れ、どう戻るかを身体で知る演習。20,000ft以上・クリーン形態で入り、戻すのはハンズオフ。回復操作は150kt（1.3Vs）から。学習記事であり実機手順ではない。',
  updated_at = NOW()
WHERE id = 'CP-2-1_DeepStall';
