-- CP-2-2: T-4 accelerated stall rewrite — sync learning_contents description with MDX meta.
-- Title unchanged. Do not run from CI; apply manually after PR merge when catalog should match.

UPDATE learning_contents
SET
  description = '加速失速は低速域と高速域の2本。低速域はベース速度から、高速域は Mach .75〜.80（指示対気速度でおよそ350kt）から。低速域は G を徐々に加えて AOA トーン、高速域は4〜5Gでバフェットを見たら引きを緩めて戻す。オーバーGはするな。学習記事であり実機手順ではない。',
  updated_at = NOW()
WHERE id = 'CP-2-2_AcceleratedStall';
