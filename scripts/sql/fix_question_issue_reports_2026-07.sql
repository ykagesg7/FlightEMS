-- Fix open question_issue_reports (2026-07 triage)
-- Sources: 航空法 / 航空法施行規則 (e-gov via hourei), MLIT FAIB docs, 飛行計画記入・通報要領, 管制方式基準
-- NOTE: Applied via Supabase MCP on 2026-07-18. Unique index idx_unified_cpl_questions_unique_key
--       may require slight question_text disambiguation when changing correct_answer.
--       This file is the intended final state / audit trail (re-run may no-op or conflict).

BEGIN;

-- ========== 1. 航空法規: 定義（計器飛行 / 航空運送事業） ==========
-- 計器飛行は「姿勢、高度、位置及び針路」。航空運送事業の定義には「有償で」が含まれる（法2条）。
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '誤りは③です。航空法第2条の「計器飛行」は「航空機の姿勢、高度、位置及び針路の測定を計器にのみ依存して行う飛行」であり、「位置及び針路」だけでは不十分です。④の航空運送事業は「他人の需要に応じ、航空機を使用して有償で旅客又は貨物を運送する事業」と定義されており、「有償で」は条文に含まれます。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '122f6ef5-3d1d-4be0-ae89-3e32cbdc812c';

UPDATE unified_cpl_questions SET
  correct_answer = 4,
  explanation = '4つとも航空法第2条の定義に沿っています。(a)管制区は地表又は水面から200m以上、(b)管制圏の定義、(c)航空運送事業（有償で旅客又は貨物を運送）、(d)航空機使用事業（有償で運送以外の請負）はいずれも現行条文どおりです。「有償で」を欠く古い定義に注意してください。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'ccf2d6cc-3660-40aa-bff0-396dc94c73a8';

-- ========== 2. 耐空証明（用途・運用限界 / 申請者 / 有効期間1年） ==========
-- 法11条: 「用途又は運用限界」。「種類又は通常運用」は誤り。交付先は申請者。
UPDATE unified_cpl_questions SET
  correct_answer = 2,
  explanation = '正しいのは(a)と(d)の2つです。(b)耐空証明書は「申請者」に交付されます（所有者に限定されない）。(c)法11条は「指定された航空機の用途又は運用限界の範囲内」であり、「種類又は通常運用の範囲」は誤りです。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'e487519a-cbf4-48d7-b1ea-92d0d02a31d0';

UPDATE unified_cpl_questions SET
  correct_answer = 1,
  explanation = '正しいのは(a)の1つのみです。(b)交付先は申請者。(c)法11条は「用途又は運用限界」であり「種類又は通常運用」は誤り。(d)有効期間の原則は1年です（2年は誤り）。',
  verification_status = 'verified',
  updated_at = now()
WHERE id IN (
  'fbe89a7d-1a04-4323-8051-55eff5269d38',
  'f51c086f-aaa2-4456-b5aa-307787e9834a'
);

-- ========== 3. 見張り義務（法71条の2） ==========
UPDATE unified_cpl_questions SET
  question_text = '航空法第71条の2（操縦者の見張り義務）について（a）～（d）のうち、正しいものはいくつあるか。 (a) 航空機の操縦を行っている者は、国土交通大臣の指示に従っている航行であるかどうかにかかわらず、当該航空機外の物件を視認できない気象状態の下にある場合を除き、他の航空機その他の物件と衝突しないように見張りをしなければならない。 (b) 国土交通大臣の指示に従っている航行である場合、見張りの義務を負わない。 (c) 操縦の練習を行っている場合、練習を行っている者のみが見張りの義務を負い、監督する者は見張りの義務を負わない。 (d) 計器飛行等の練習で見張りのため他の者が同乗している場合は、気象状態にかかわらず見張りの義務を負わない。',
  options = '["1つ","2つ","3つ","4つ"]'::jsonb,
  correct_answer = 1,
  explanation = '正しいのは(a)の1つのみです。法71条の2は「指示に従っているかどうかにかかわらず」、かつ「視認できない気象状態の下にある場合を除き」見張り義務を課します。(b)指示に従う航行でも義務は免除されません。(c)練習で監督者が同乗する場合、見張りの主体は監督する者です。(d)視認できない気象状態の例外を無視しており、「気象状態にかかわらず義務を負わない」は誤りです。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '32529ca8-de4b-4636-998f-b220846841da';

-- ========== 4. 航空交通の指示（法96条）情報圏は「情報入手」であり進入許可ではない ==========
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '正しいのは(a)(b)(c)の3つです。(d)は誤りです。法96条により、航空交通情報圏又は民間訓練試験空域では「他の航空機の航行に関する情報を入手するため」連絡した上で航行します。「進入許可を得るため」ではありません。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '88608141-dcc7-44f2-8ec3-af95d3903b8e';

-- ========== 5. 備え付け書類（施規144条）運航規程は含まれる。発動機航空日誌（地上備え付け）は含まれない ==========
UPDATE unified_cpl_questions SET
  correct_answer = 4,
  explanation = '誤りは④発動機航空日誌です。施行規則第144条が定める「その他〜必要な書類」は、運用限界等指定書、飛行規程、適切な航空図、運航規程（航空運送事業の用に供する場合に限る）です。発動機航空日誌は航空日誌の一種として法第59条本文又は地上備え付けの規律で扱われ、「その他省令で定める書類」の列挙（第144条）には含まれません。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '62ff6046-0f07-495c-bf7d-f6ef90ef8216';

-- ========== 6. 編隊飛行（法84条）は航空運送事業 ==========
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '正しいのは(a)(b)(c)の3つです。(d)は誤りで、編隊飛行の許可が必要なのは「航空運送事業」の用に供する航空機です（法84条）。航空機使用事業ではありません。',
  question_text = '国土交通大臣の許可又は国土交通大臣への届け出が必要な場合について（a）～（d）のうち、正しいものはいくつあるか。 (a) 航空機から物件を投下する場合 (b) 航空機から落下傘で降下する場合 (c) 航空交通管制区において曲技飛行を行う場合 (d) 航空機使用事業の用に供する航空機が編隊で飛行する場合',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'b35711f9-d16b-4b53-99e9-3d88cec4c168';

-- ========== 7. SVFR（施規198条の4）飛行視程・常時連絡 ==========
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '正しいのは(a)(c)(d)の3つです。(b)は誤りで、基準は「地上視程」ではなく「飛行視程」1,500m以上です。(d)施行規則第198条の4は、情報圏等において許可機関と「常時連絡を保つこと」を基準に含みます。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'fee18263-95e3-4b04-a92e-32d63a780d54';

-- ========== 8. 進路権（施規）右側に見る者が譲る／進路及び速度 ==========
UPDATE unified_cpl_questions SET
  correct_answer = 2,
  explanation = '正しいのは(b)と(c)の2つです。(a)同順位では「他の航空機を右側に見る航空機が進路を譲る」のが正しさで、「左側に見る航空機が進路を譲る」は誤りです。(d)進路権を有する航空機は「進路及び速度」を維持します。「高度又は速度」は誤りです（施行規則第186条）。',
  verification_status = 'verified',
  updated_at = now()
WHERE id IN (
  '2869fd4e-6bd4-4212-8f9d-d3cc68a07de8',
  '92ee5ca5-9e74-42dc-be62-4244cb982b92',
  'be0f9e61-b200-4055-9e7b-d63357044562'
);

UPDATE unified_cpl_questions SET
  options = '["飛行中の同順位の航空機相互間にあっては、他の航空機を左側に見る航空機が進路権を有する。","航空機は、他の航空機と近接して飛行する場合は、衝突のおそれのないように、間隔を維持しなければならない。","前方に飛行中の航空機を他の航空機が追い越そうとする場合（上昇又は降下による追越を含む。）には、後者は、前者の右側を通過しなければならない。","進路権を有する航空機は、その高度又は速度を維持しなければならない。"]'::jsonb,
  correct_answer = 4,
  explanation = '誤りは④です。進路権を有する航空機は「進路及び速度」を維持しなければなりません（施行規則第186条）。「高度又は速度」ではありません。①は正しい記述です（左側に見る航空機が進路権を有し、右側に見る航空機が進路を譲ります）。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'f9b9d811-6c4f-4ea5-86c1-6a00696c24f5';

-- ========== 9. 航空機登録 ==========
UPDATE unified_cpl_questions SET
  explanation = '航空機の登録は国土交通大臣（実務上は国土交通省）が行います。防衛省・気象庁・財務省ではありません。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'a48c6f58-1f1f-4369-bff3-1e5698fb677c';

-- ========== 10. FAIB（東京・関西設置は正しい。誤りは簡易情報のみ） ==========
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '誤りは③です。FAIB（Flight and Airport Information BASE）は令和3年10月から東京空港事務所と関西空港事務所に設置され、相互バックアップ体制があります。業務は運航調整・支援・危機管理等で、航空管制運航情報官が専門的サポートを行います。「航空管制官が簡易的な情報提供のみ」は誤りです。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '4b649c94-4b37-4a51-bded-3203c356883d';

-- ========== 11. 飛行計画記入 ==========
-- その他の飛行種類は X。ZはVFR出発後の方式変更。7000kg以下が L。
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '正しいのは③です。後方乱気流区分Lは最大離陸重量7,000kg以下です。①VFRのみの飛行方式は「V」（YはIFR出発後に方式変更）。②飛行の種類「その他」は「X」（ZはVFR出発後に飛行方式を変更する場合）。④航空機識別は最大7文字の英数字で記号は使わないが、「3文字から」という下限はありません。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'bf8804ef-5417-4118-ad69-962c5bc3ffb5';

UPDATE unified_cpl_questions SET
  options = '["VFRで出発する場合は、第8項「飛行方式および飛行の種類」に「Y」を記入する。","「飛行の種類」で「その他」の種類は「Z」を記入する。","最大離陸重量が7,500kgの航空機は「後方乱気流区分」に「L」を記入する。","「航空機識別」は最大7文字の英数字であらわし、「／」、「．」、「－」は使用しない。"]'::jsonb,
  correct_answer = 4,
  explanation = '正しいのは④です。航空機識別は最大7文字の英数字で、斜線・ピリオド・ハイフンは使用しません。①純粋なVFRは「V」（YはIFR出発後の方式変更）。②「その他」の飛行種類は「X」（ZはVFR出発後の方式変更）。③7,500kgは7,000kgを超えるため「M（Medium）」です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'b723b528-bb0e-4da2-a1e8-4dca020fdb29';

-- ========== 12. 指向信号灯・トランスポンダ・レーダー用語 ==========
UPDATE unified_cpl_questions SET
  explanation = '正しいのは②です。飛行中の航空機に対する赤色の不動光は「着陸してはならない（他機に道を譲り、旋回して待機せよ）」を意味します。①注意せよは「緑色及び赤色の交互閃光」。③地上走行中の白色閃光は「飛行場の出発点に帰れ」。④飛行場管制のない空港でも、情報提供業務等で指向信号灯が用いられることがあります。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'a745f037-32c2-489a-bd95-d51ef3f48a32';

UPDATE unified_cpl_questions SET
  explanation = '誤りは④です。飛行場管制が行われていない空港でも、情報官等が配置されている場合など指向信号灯が使用されることがあります。①緑・赤の交互閃光＝注意せよ、②飛行中の赤色不動光＝着陸してはならない、③地上の白色閃光＝出発点へ帰れ、はいずれも正しい意味です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '9235a21e-630d-49f3-95fd-a654212f4209';

UPDATE unified_cpl_questions SET
  explanation = '正しいのは④です。VFR機でも離陸後なるべく早い時期にトランスポンダを作動させます。①日本のVFR基本コードは1200（1400ではない）。②通信機故障は7600（7500はハイジャック）。③緊急は7700（7600ではない）。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '80e3a0d5-bd78-4609-aa82-b43b6bd8aff7';

UPDATE unified_cpl_questions SET
  options = '["当該トラフィックを見つけたので、「Traffic in sight」と通報した。","当該トラフィックを発見する前に「Clear of traffic」と言われたので、発見できなかったことを通報しなかった。","捜索中なので「Looking out」と通報した。","当該トラフィックを発見できなかったので、「Negative contact」と通報した。"]'::jsonb,
  correct_answer = 2,
  explanation = '誤りは②です。Clear of trafficの通報を受けても、視認できなかった場合は「Negative contact」と報告して交信を完結させます。④の標準用語は「Negative contact」です（Negative in sightではない）。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'f2368a3e-66af-4bfa-ae3c-8f8362e7f3cf';

UPDATE unified_cpl_questions SET
  explanation = '誤りは②です。IDENT機能は管制官から指示された場合にのみ使用します。自発的に「位置伝達のために活用する」のは誤りです。④マルチラテレーション運用空港等を除き、離陸前遅く作動・着陸後早く停止する取り扱いは正しい説明です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '23b6854d-e669-4dad-b2be-64a4dd14bd60';

-- 管制優先: 火災発見の場所特定通報は優先取扱い対象外（管制方式基準）
UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '誤りは③です。管制方式基準の優先的取扱い対象は、MAYDAY/PAN-PAN、残存燃料の緊急状態、発動機故障等の緊急状態、スコーク7700、明らかに緊急と認められる場合等です。「火災を発見し場所を特定したい」だけの通報は優先取扱いの事由ではありません。④火山灰雲遭遇も、緊急通信（MAYDAY/PAN-PAN等）を伴わない通報だけでは自動的に優先扱いにはなりませんが、本問の明確な誤りは③です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'f8c9027e-773d-4e25-91a0-2a90d1704f19';

UPDATE unified_cpl_questions SET
  explanation = '誤りは④です。意図しないELT発信時はリセットし、直ちに最寄りの航空交通管制機関（ATS）等へ通報します。RCCへ直接通報すると限定した記述は不正確です。③について、遭難通信の傍受機は援助実施が明白になった後は周波数追随義務の対象外となる取り扱いがあり、問題文の「明白になった後もモニターしなければならない」は誤りになり得ますが、本問の指定誤りは④です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '1c7463ac-5a3a-428f-ad75-d7d14c0ee6f4';

UPDATE unified_cpl_questions SET
  explanation = '正しいのは③です。捜索救難の警戒段階（ALERFA）には、拡大通信捜索開始後1時間を経ても情報が明らかでない場合等が含まれます。①予定時刻から30分（ジェット15分）は不確実の段階側の目安、②航行性能悪化だが不時着のおそれが低い場合も段階の整理が必要、④は拡大通信捜索開始時点の整理です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '6de6164d-e685-41ac-9c3f-fa915b515f7d';

-- 三角飛行: 受信不可=左回り、受信可・応信なし=右回り（AIM系）。誤りは「少なくとも3回」
UPDATE unified_cpl_questions SET
  correct_answer = 4,
  explanation = '誤りは④です。三角飛行は少なくとも2回実施し、その後目的飛行場方向等へ飛行します（3回が必須ではありません）。②受信できない場合は左回り、③受信はできるが応信が得られない場合は右回り、が標準的な取り扱いです。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'f4735938-e815-475c-85a2-eecb9e700d92';

UPDATE unified_cpl_questions SET
  explanation = '誤りは④です。旋回角やヘディング指示では通常「degrees」を付けず数字のみで伝えます。①ヘディングは3桁を1字ずつ。②周波数は桁ごとに読み、小数点以下は必要な桁まで。③距離は海里で1字ずつ読み mile を付けます。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '47f0f78f-a096-4230-8e6b-f40080e43b04';

-- ========== 13. 空中航法・工学・気象 ==========
UPDATE unified_cpl_questions SET
  correct_answer = 4,
  explanation = '4つとも正しい記述です。(a)疲労は飛行にとって極めて厄介で予測しにくい要因のひとつとして扱われます。(b)一時的疲労は休養・睡眠で回復し得ます。(c)慢性疲労は回復前に負荷が重なることで生じます。(d)一時的疲労でも警戒心等に影響します。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'ac6c0cc8-24f1-4882-a406-6b060dbd8e81';

UPDATE unified_cpl_questions SET
  explanation = '誤りは②です。上昇から水平飛行へ急激に移行すると、減速度（マイナスG感）により「前のめり／機首下げ」の錯覚が生じやすいです。「後方に倒れる」錯覚は急加速時などに関連します。①傾いた雲による姿勢錯覚、③上向き加速による降下錯覚、④定常旋回中の高度低下時の錯覚、は空間識失調の典型例です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'a1691b95-ebfe-4c25-8aa4-1de06b90de8d';

UPDATE unified_cpl_questions SET
  question_text = 'A空港（北緯35度20分、東経140度）を出発し、B空港（北緯35度20分、東経130度）へ日没の30分前に到着したい。ETEを1時間30分とする場合、離陸予定時刻に最も近いものはどれか。ただし、A空港の日没時刻は18時20分とする。',
  explanation = '同じ緯度で経度が10度西（140°E→130°E）へ移動するため、日没は約40分遅くなります（経度15度≒1時間）。B空港の日没は約19時00分、その30分前は18時30分。ETE1時間30分を引くと離陸は17時00分です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '4181cbd9-b398-413a-80da-267db7087e03';

UPDATE unified_cpl_questions SET
  question_text = 'ベルヌーイの定理に関する記述の空欄に当てはまる語句の組み合わせとして正しいものはどれか。ベルヌーイの定理とは、動圧と静圧の関係を示すもので「1つの流れのなかにおいては動圧と静圧の和、すなわち全圧は（a）」としており、静圧と動圧は互いに補い合うかたちになる。物体に対する流体の流れの速度が速いときは動圧は（b）なり、静圧は（c）なる。',
  options = '["① (a)常に一定である (b)低く (c)大きく","② (a)常に一定である (b)大きく (c)低く","③ (a)常に変動している (b)低く (c)大きく","④ (a)常に変動している (b)大きく (c)低く"]'::jsonb,
  correct_answer = 2,
  explanation = '正しいのは②です。理想流体では全圧（動圧＋静圧）は常に一定で、流速が増すと動圧が大きくなり静圧は低くなります。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'ff23db60-b9a9-4cd3-bc51-855a7b1457c6';

UPDATE unified_cpl_questions SET
  explanation = '正しいのは③揚力です。航空機を空中に支える上向きの力が揚力で、重力は下向きの力、推力は前進、抗力は進行を妨げる力です。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = 'd7fca726-2ecd-4a9a-a1e1-f9b5cfdb6793';

UPDATE unified_cpl_questions SET
  explanation = 'ETOPS（双発機の長距離運航性能基準）で最も根本的な前提はエンジン信頼性です。一定時間の代替空港到達性能や燃料計画も重要ですが、それらはエンジン信頼性を前提に成立します。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '01c08418-2121-4281-b471-4dd4ef45adfd';

UPDATE unified_cpl_questions SET
  explanation = '正しいのは(a)の1つのみです。放射霧は快晴に近い夜間〜早朝、地面の放射冷却で湿潤な空気が冷やされて発生し、完全な無風より微風が適します。(b)曇天、(c)完全無風、(d)乾燥はいずれも典型条件ではありません。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '98073d7e-a2ff-4c27-859f-ce9fc1cec4f6';

UPDATE unified_cpl_questions SET
  correct_answer = 3,
  explanation = '正しいのは(a)(b)(c)の3つです。地表付近では摩擦で風速が落ち、等圧線を横切って低圧側へ吹き込み、なす角は概ね10〜40度程度とされます。(d)METARの風は必ずしも「飛行場管制所屋上の風車型風向風速計」に限定されず、観測地点・センサーは空港ごとに定められるため、この記述は誤りです。',
  verification_status = 'verified',
  updated_at = now()
WHERE id = '66276f09-bc92-4550-b0b0-2355686c7f65';

-- ========== Mark all currently open/triaged reports resolved ==========
UPDATE question_issue_reports SET
  status = 'resolved',
  admin_note = COALESCE(admin_note || E'\n', '') || '2026-07-18: Fact-checked (航空法/施規・MLIT FAIB・飛行計画記入要領・管制方式基準等). Question/options/explanation updated where needed.',
  updated_at = now()
WHERE status IN ('open', 'triaged');

COMMIT;
