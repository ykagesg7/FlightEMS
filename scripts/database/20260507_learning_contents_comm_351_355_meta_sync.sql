-- 航空通信 3.5.1〜3.5.5: MDX 本文化後の learning_contents メタ全集約（冪等 UPDATE）
-- 適用後: Web・ダッシュボードのタイトル/説明が MDX meta と一致する想定
-- 関連: src/content/lessons/3.5.*_*.mdx

BEGIN;

UPDATE learning_contents
SET
  title = '【航空通信】航空交通業務の基礎：指示と助言を間違えるアホなパイロット',
  description = '管制官からの無線が「指示」か「助言」かで責任の所在が変わる。航空交通業務（ATS）の三本柱と短く的確な通信。CPL 学科向け概要。',
  updated_at = now()
WHERE id = '3.5.1_AirTrafficServices';

UPDATE learning_contents
SET
  title = '【航空通信】航空情報業務：AIPとNOTAM、「古い地図」で迷子になるアホなパイロット',
  description = 'AIP（恒久の設計図）と NOTAM（一時的変更の速報）の二層構造と出発前ブリーフィングの順序。NOTAM は任意ではない。CPL 学科向け概要。',
  updated_at = now()
WHERE id = '3.5.2_AeronauticalInformation';

UPDATE learning_contents
SET
  title = '【航空通信】無線電話の基本手順：ダブトラの恐怖と「予測と復唱」の極意',
  description = '呼出しの型、復唱（リードバック）、ダブトラ（同時発話）回避、指示の予測と聴取。CPL 学科向け概要。',
  updated_at = now()
WHERE id = '3.5.3_RadioCommunication';

UPDATE learning_contents
SET
  title = '【航空通信】緊急時の通信手順：パニックをねじ伏せる「事実」と「意図」の切り分け',
  description = '遭難（MAYDAY）と緊急（PAN PAN）の区別、事実と意図を順に伝える構成。音声手順の正本は運用資料。CPL 学科向け概要。',
  updated_at = now()
WHERE id = '3.5.4_EmergencyProcedures';

UPDATE learning_contents
SET
  title = '【航空通信】管制用語とフレーズロジー：聞き返す勇気「Say again」と完璧な様式美',
  description = '標準語・フレーズロジーの目的、Wilco と情報了解の違い、Unable／Stand by、Say again と Correction。CPL 学科向け概要。',
  updated_at = now()
WHERE id = '3.5.5_ATCPhraseology';

-- 記事一覧・テスト結果まわりで参照されるタイトルを learning_contents と揃える
UPDATE learning_test_mapping AS m
SET
  content_title = lc.title,
  updated_at = now()
FROM learning_contents AS lc
WHERE m.learning_content_id = lc.id
  AND lc.id IN (
    '3.5.1_AirTrafficServices',
    '3.5.2_AeronauticalInformation',
    '3.5.3_RadioCommunication',
    '3.5.4_EmergencyProcedures',
    '3.5.5_ATCPhraseology'
  );

COMMIT;
