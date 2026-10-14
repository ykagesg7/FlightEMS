-- CP-3-2 MDX T-4 Traffic Stall 版に合わせる。title / description のみ。is_published は触らない。
-- 本番は上様承認後に別途適用。再実行しても title / description は同じ値になる。

UPDATE learning_contents
SET
  title = '【操縦】第11話：兆候を見たらリカバリー ～Traffic Stall～',
  description = 'Traffic Stallは形ではない。buffetの明らかな増加で即リカバリー。完了は降下停止または上昇（高度計とVVI反転）、そして継続できる速度。学習記事であり実機手順ではない。',
  updated_at = NOW()
WHERE id = 'CP-3-2_PatternATS';
