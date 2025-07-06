-- 編隊飛行記事をlearning_contentsテーブルに挿入
INSERT INTO learning_contents (
    id,
    title,
    description,
    content,
    category,
    subcategory,
    difficulty,
    estimated_time,
    tags,
    author,
    created_at,
    updated_at
) VALUES (
    '4.1_FormationFlightTurningRejoin',
    '【操縦法】編隊飛行その１、旋回リジョインをマスターせよ！',
    '編隊飛行における旋回リジョインの技術を浪速のゾウさんとトム兄ぃが解説します。',
    'src/content/4.1_FormationFlightTurningRejoin.mdx',
    '操縦法',
    'formation_flight',
    'intermediate',
    30,
    ARRAY['編隊飛行', '旋回リジョイン', '操縦法', '航空技術'],
    'FlightAcademy',
    NOW(),
    NOW()
);

-- 記事が正常に挿入されたか確認
SELECT * FROM learning_contents WHERE id = '4.1_FormationFlightTurningRejoin';
