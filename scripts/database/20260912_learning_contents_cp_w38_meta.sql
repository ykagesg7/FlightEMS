-- W38 drip meta only. Do not flip is_published; cron owns that.

UPDATE learning_contents
SET
  title = '【操縦】第13話：突っ込んだNoseは最短で引き起こせ ～Nose-low recovery～',
  description = 'Nose-lowは近い地平線へロールし、最短半径で引き起こせ。バフェットか目標Gの早い方まで引く。訓練空域は4–5 G、速度は250–400 kt。数字はT-38枠。',
  updated_at = NOW()
WHERE id = 'CP-4-2_NoseLow';

UPDATE learning_contents
SET
  title = '【操縦】第14話：図形の前に Contract を決めろ ～Aerobatic contract～',
  description = '曲技は図形の前に Contract。smooth に飛べ。進入と Box を先に決める。垂直面は 10,000 ft 以上を計画。10° ごとに 10 kt および/または 500 ft のリード。Box は開始から完了。数字は T-38 枠。',
  updated_at = NOW()
WHERE id = 'CP-5-1_AerobaticContract';

UPDATE learning_contents
SET
  title = '【操縦】第15話：Nose を一点に釘付けするな ～Aileron roll～',
  description = 'エルロンロールは任意の速度・ピッチから滑らかに回せ。Nose を一点に釘付けするな。終盤は舵圧を緩めて水平の行き過ぎを防ぐ。T-38はロールレートが極めて高い。',
  updated_at = NOW()
WHERE id = 'CP-5-2_AileronRoll';
