-- Phase B: 空中航法 3.4.1〜3.4.4・航空通信 3.5.1〜3.5.3 の learning_contents メタを MDX meta に揃える（冪等）
-- 実行: Supabase SQL Editor。learning_test_mapping.content_title は別スクリプトで更新。

UPDATE learning_contents
SET
  title = '【空中航法】推測航法の基礎：針路・距離・時間を一本の線でつなぐ',
  description = '推測航法（DR）の考え方、真針路・偏流・対地速度との関係を学科向けに整理する。',
  updated_at = now()
WHERE id = '3.4.1_DeadReckoning';

UPDATE learning_contents
SET
  title = '【空中航法】VOR 航法：放射状線と番兵の「角度」を読み切れ',
  description = 'VOR の基本原理、CDI・TO/FROM の読み方、試験で落としやすい誤解を整理する。',
  updated_at = now()
WHERE id = '3.4.2_VORNavigation';

UPDATE learning_contents
SET
  title = '【空中航法】GNSS／GPS 航法の基礎：補助から主役へ、落とし穴も増えた',
  description = 'GNSS による位置決め、従来航法補助との違い、冗長性と誤情報への注意を整理する。',
  updated_at = now()
WHERE id = '3.4.3_GPSNavigation';

UPDATE learning_contents
SET
  title = '【空中航法】飛行計画と航法計算：燃料・時間・代替を一つのストーリーにまとめる',
  description = '飛行計画の構成要素（航路・高度・風・所要時間・燃料・代替空港）を学科向けに整理する。',
  updated_at = now()
WHERE id = '3.4.4_FlightPlanning';

UPDATE learning_contents
SET
  title = '【航空通信】航空交通業務の基礎：管制・情報・警急を一本の線で押さえる',
  description = '航空交通業務（ATS）を管制・飛行情報・捜索救難警急の三本柱で整理する。',
  updated_at = now()
WHERE id = '3.5.1_AirTrafficServices';

UPDATE learning_contents
SET
  title = '【航空通信】航空情報業務：AIP・NOTAM を「運航の設計図」として読む',
  description = '航空情報の体系（AIP・補足・NOTAM 等）と出発前ブリーフィングで確認すべき項目を整理する。',
  updated_at = now()
WHERE id = '3.5.2_AeronauticalInformation';

UPDATE learning_contents
SET
  title = '【航空通信】無線電話の基本手順：呼出し・復唱・クリアランスを外さん',
  description = '航空無線の基本手順（呼出し・復唱・読み方）とクリアランス確認の文化を整理する。',
  updated_at = now()
WHERE id = '3.5.3_RadioCommunication';
