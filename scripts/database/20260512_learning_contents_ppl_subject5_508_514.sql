-- PPL Master Subject 5（航空法規）運航・地上・報告ほか 7 本を learning_contents に冪等登録（MDX meta と一致）
-- 適用: Supabase MCP execute_sql（project_id = fstynltdfdetpyvbrswr）または SQL Editor

INSERT INTO learning_contents (
  id,
  title,
  category,
  sub_category,
  description,
  order_index,
  parent_id,
  content_type,
  is_published,
  updated_at
) VALUES
  (
    'PPL-5-4-1_AirspaceAndFacilitiesOverview',
    '【航空法規】空域と航空路の基礎：見えない国境線と「誰が守ってくれるか」のハック術',
    'PPL',
    '航空法規',
    '空には白線も国境もない。クラスA〜Gの違いは「誰が責任を持つか」の境界線だ。F-2で山肌を縫ったパイロットが教える、見えない空域の生存戦略。',
    508,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-2_CaptainAuthorityAndPreflight',
    '【航空法規】機長の権限と出発前確認：作業を流すアホと「命の盾」',
    'PPL',
    '航空法規',
    '出発前確認をただの「作業」として流すヤツは空で死ぬ。機長の権限と責任という名の重圧を背負い、チームの命を守るためのプロのメンタリティをハックする。',
    509,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-3_RecurrentProficiencyOverview',
    '【航空法規】特定操縦技能の概要：妥協は死を招く「永遠の腕試し」',
    'PPL',
    '航空法規',
    '「免許を取ったらゴール」は大ウソ。数年ごとに国からガチで腕前を試される、空のプロに課せられた「永遠の腕試し（特定操縦技能審査）」の真髄をハックする。',
    510,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-4_SafetyEndangeringProhibitions',
    '【航空法規】安全阻害行為とは：悪ふざけが命を奪う「絶対踏んではいけない線」',
    'PPL',
    '航空法規',
    '「酒飲んで飛ばない、爆弾持ち込まない。自分には関係ない」と舐めているヤツは空で死ぬ。ちょっとした慢心や悪ふざけが即「免停」に直結する航空法の絶対ルールをハックする。',
    511,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-5_AccidentIncidentReportingBasics',
    '【航空法規】事故・重大インシデントの報告：隠蔽するアホと「命のフィードバック」',
    'PPL',
    '航空法規',
    'ミスを隠すヤツは空を飛ぶ資格なし！嫁の皿を割って隠蔽したオッサンの悲劇から学ぶ、「事故と重大インシデント」の報告の型と、未来のパイロットを救うエアマンシップ。',
    512,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-6_AerodromeGroundOperationsBasics',
    '【航空法規】飛行場地上運用の基礎：夜の迷路と「誤進入」を防ぐ確実な型',
    'PPL',
    '航空法規',
    '空を飛ぶより、地上を這う方が難しい！？夜の空港で迷子になり、滑走路に誤進入する恐怖。地上の標識と管制の許可を完璧に読み解く、地上運用のサバイバル術をハックする。',
    513,
    NULL,
    'text',
    true,
    NOW()
  ),
  (
    'PPL-5-4-7_IFRMinimumAltitudeIntroForPPL',
    '【航空法規】最低高度への入門：VFRの限界と「逃げ道の残り」',
    'PPL',
    '航空法規',
    '最低安全高度は「余裕の高さ」ではない。エンジン停止などの最悪時に、地上を巻き込みにくくするための下限と逃げ道の話だ。VFRとIFRの視点の違いから、空のサバイバルをハックする。',
    514,
    NULL,
    'text',
    true,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  sub_category = EXCLUDED.sub_category,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  content_type = EXCLUDED.content_type,
  is_published = EXCLUDED.is_published,
  updated_at = EXCLUDED.updated_at;
