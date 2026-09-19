-- W39 drip meta only. Do not flip is_published; cron owns that.

UPDATE learning_contents
SET
  title = '【操縦】第16話：パラメータを止めるな ～Lazy Eight～',
  description = 'Lazy Eightはパラメータが止まらない。滑らかで左右対称につなげ。45°で最大ピッチ、90°で地平線通過、180°で水平かつ進入速度。進入は350 kt / 95% rpm。数字はT-38枠。',
  updated_at = NOW()
WHERE id = 'CP-5-3_LazyEight';

UPDATE learning_contents
SET
  title = '【操縦】第17話：機首は円で回せ、Gは抜くな ～Barrel Roll～',
  description = 'Barrel Rollは協調ロールで機首が一点の周りを円で回る。全行程positive G。進入は30–45°オフセットから。400 kt / 95% rpm。4つのチェックポイントを通る。数字はT-38枠。',
  updated_at = NOW()
WHERE id = 'CP-5-4_BarrelRoll';

UPDATE learning_contents
SET
  title = '【操縦】第18話：頂点は水平、完了は進入に戻せ ～Loop～',
  description = 'Loopは垂直面で円を描く。滑らかなstraight pull。頂点は翼水平、over-the-topは150 kt超。完了は進入パラメータ。進入は500 kt / MIL。引きは4.5–5 G。数字はT-38枠。',
  updated_at = NOW()
WHERE id = 'CP-5-5_Loop';
