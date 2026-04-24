-- CPL 航空気象 3.3.1〜3.3.12: learning_contents の title / description を MDX meta と一致させる。
-- PrevNextNav の order_index は既存運用に合わせ 360〜371 を維持。
-- learning_test_mapping.content_title も同タイトルへ揃える（ReviewContentLink 表示用）。
-- 冪等: learning_contents は ON CONFLICT (id) DO UPDATE。

BEGIN;

INSERT INTO learning_contents (
  id, title, category, description, order_index, content_type,
  is_published, sub_category, created_at, updated_at
) VALUES
  (
    '3.3.1_StandardAtmosphere',
    '【航空気象】標準大気と大気構造：シーフォグの恐怖と「見えない基準線」',
    'CPL学科',
    '快晴の空を一瞬で地獄に変えるシーフォグ（海霧）の恐怖。気象の絶対基準「標準大気（ISA）」を知ることで、天候急変のサインを肌で感じるプロのセンサーを養う。',
    360,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.2_CloudsAndPrecipitation',
    '【航空気象】雲と降水：育っていく「氷の凶器」とインテイクの恐怖',
    'CPL学科',
    '雲はただの水蒸気ではない。冬の雲中でインテイクに張り付いた着氷（アイシング）が育っていく恐怖。空の地雷原を読み解く「雲と降水」のメカニズムをハックする。',
    361,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.3_FrontsAndWeatherSystems',
    '【航空気象】前線と気象システム：セントエルモの火と「見えない積乱雲」の恐怖',
    'CPL学科',
    '前線の積乱雲は他の雲に隠されて見えない。無線機の「チリチリ音」と、美しくも恐ろしい「セントエルモの火」が告げる被雷のサインから、前線の立体構造をハックする。',
    362,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.4_LowPressureSystems',
    '【航空気象】低気圧システムと発達過程：台風並みの爆風と「化け物の寿命」',
    'CPL学科',
    '最大瞬間風速40kt！東北の冬の爆風（西高東低）をねじ伏せたパイロットの言葉から、温帯低気圧の発達メカニズムと「怒りの等圧線」を読む極意を叩き込む。',
    363,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.5_AtmosphericStability',
    '【航空気象】大気の安定性とショワルター指数：ペーペー時代のダイバートと雷雲の恐怖',
    'CPL学科',
    '快晴の空から突如として湧き上がる夏の積乱雲（CB）。ペーペー時代の心臓バクバクのダイバート経験から、ショワルター指数（SSI）のマイナスの恐怖をハックする。',
    364,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.6_AtmosphericComposition',
    '【航空気象】大気組成と水蒸気の物理：霧のち晴れと「気を抜いたパイロット」の絶望',
    'CPL学科',
    '朝の霧を見て「フライト休みだ！」と気を抜いた学生を襲う、突然の快晴。水蒸気と露点の関係（スプレッド）を知り、空の目隠しが外れるタイミングを予測する極意を伝授する。',
    365,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.7_WesterliesAndWind',
    '【航空気象】偏西風と大気循環：100ktの向かい風と「命の砂時計」',
    'CPL学科',
    '冬の高度3万フィートで吹く100kt以上のジェット気流。向かい風が燃料を削り取る恐怖のフライトから、地球規模の風「偏西風」の理屈をハックする。',
    366,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.8_ICAOStandardAtmosphere',
    '【航空気象】ICAO標準大気の詳細：夏のバテと冬の激突、「5つの高度」の騙し合い',
    'CPL学科',
    '高度計は平気でウソをつく。真高度、気圧高度、密度高度の違いとは？ 夏のバテと冬の空中衝突を防ぐ、QNHとQNEの切り替えの真の目的をハックする。',
    367,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.9_WeatherHazards',
    '【航空気象】航空気象の危険現象：死の粉「火山灰」と空の地雷原',
    'CPL学科',
    '雷や乱気流だけじゃない。日本で最も恐ろしい空の罠「火山灰」の恐怖。エンジンを一瞬で破壊する見えない死の粉から、危険現象を回避するサバイバル術をハックする。',
    368,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.10_CloudTypes',
    '【航空気象】雲の種類と特徴：成長するバケモノと「隠れた積乱雲」を見抜け',
    'CPL学科',
    '数十分でカワイイ雲がバケモノ（積乱雲）に育つ恐怖。そして大人しい層雲に隠された地雷。10種の雲の顔つきから、空の死神の手配書を読み解く極意を伝授する。',
    369,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.11_VisibilityAndFog',
    '【航空気象】視程と霧：高度を狂わせる「白い絨毯」の錯覚と罠',
    'CPL学科',
    '霧はただ視界を奪うだけじゃない。パイロットの「高度感覚」を狂わせる白い絨毯の恐怖。東北の海霧（シーフォグ）から学ぶ、霧の発生条件と空間識失調（錯覚）の罠をハックする。',
    370,
    'text',
    true,
    '航空気象',
    now(),
    now()
  ),
  (
    '3.3.12_Turbulence',
    '【航空気象】乱気流の種類と対策：キャノピーに頭をぶつける「見えない洗濯機」',
    'CPL学科',
    '冬の東北、20-30ktの爆風の中で山肌を縫う極限飛行。キャノピーに頭をぶつけるほどの「見えない洗濯機（乱気流）」の種類と、機体を壊さないサバイバル操縦術をハックする。',
    371,
    'text',
    true,
    '航空気象',
    now(),
    now()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  sub_category = EXCLUDED.sub_category,
  updated_at = EXCLUDED.updated_at;

UPDATE learning_test_mapping AS m
SET
  content_title = lc.title,
  updated_at = now()
FROM learning_contents AS lc
WHERE m.learning_content_id = lc.id
  AND lc.id IN (
    '3.3.1_StandardAtmosphere',
    '3.3.2_CloudsAndPrecipitation',
    '3.3.3_FrontsAndWeatherSystems',
    '3.3.4_LowPressureSystems',
    '3.3.5_AtmosphericStability',
    '3.3.6_AtmosphericComposition',
    '3.3.7_WesterliesAndWind',
    '3.3.8_ICAOStandardAtmosphere',
    '3.3.9_WeatherHazards',
    '3.3.10_CloudTypes',
    '3.3.11_VisibilityAndFog',
    '3.3.12_Turbulence'
  );

COMMIT;
