-- 既存ExamQuestion JSONデータのデータベース移行スクリプト
-- FlightAcademy - ExamTab Integration Migration
-- 実行日: 2025-06-01

DO $$
DECLARE
    test_user_id UUID;
    aviation_weather_category_id UUID;
    aviation_engineering_category_id UUID;
    aviation_law_category_id UUID;
    aviation_communication_category_id UUID;
    air_navigation_category_id UUID;
    legacy_deck_id UUID;
BEGIN
    -- テスト用ユーザーIDを取得
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    -- カテゴリIDを取得/作成
    SELECT id INTO aviation_weather_category_id FROM question_categories WHERE name = '気象';
    SELECT id INTO aviation_engineering_category_id FROM question_categories WHERE name = '航空工学';
    SELECT id INTO aviation_law_category_id FROM question_categories WHERE name = '航空法規';
    SELECT id INTO aviation_communication_category_id FROM question_categories WHERE name = '通信';
    SELECT id INTO air_navigation_category_id FROM question_categories WHERE name = '航法';

    -- 既存データ用のレガシーデッキを作成
    INSERT INTO card_decks (user_id, category_id, title, description)
    SELECT test_user_id, aviation_weather_category_id, '既存Exam問題（気象）', '既存システムから移行された気象関連問題'
    WHERE NOT EXISTS (SELECT 1 FROM card_decks WHERE title = '既存Exam問題（気象）');

    INSERT INTO card_decks (user_id, category_id, title, description)
    SELECT test_user_id, aviation_engineering_category_id, '既存Exam問題（航空工学）', '既存システムから移行された航空工学問題'
    WHERE NOT EXISTS (SELECT 1 FROM card_decks WHERE title = '既存Exam問題（航空工学）');

    INSERT INTO card_decks (user_id, category_id, title, description)
    SELECT test_user_id, aviation_law_category_id, '既存Exam問題（航空法規）', '既存システムから移行された航空法規問題'
    WHERE NOT EXISTS (SELECT 1 FROM card_decks WHERE title = '既存Exam問題（航空法規）');

    INSERT INTO card_decks (user_id, category_id, title, description)
    SELECT test_user_id, aviation_communication_category_id, '既存Exam問題（通信）', '既存システムから移行された通信関連問題'
    WHERE NOT EXISTS (SELECT 1 FROM card_decks WHERE title = '既存Exam問題（通信）');

    INSERT INTO card_decks (user_id, category_id, title, description)
    SELECT test_user_id, air_navigation_category_id, '既存Exam問題（航法）', '既存システムから移行された航法問題'
    WHERE NOT EXISTS (SELECT 1 FROM card_decks WHERE title = '既存Exam問題（航法）');

    -- 既存問題データを移行

    -- 1. 航空気象問題 (id: "1")
    SELECT id INTO legacy_deck_id FROM card_decks WHERE title = '既存Exam問題（気象）' LIMIT 1;
    INSERT INTO questions (deck_id, question_text, options, correct_option_index, explanation, difficulty_level)
    SELECT legacy_deck_id,
           '乱気流の主な原因はどれですか？',
           ARRAY['気温差', '風速の変化', '高湿度', '低気圧'],
           0,
           '乱気流は主に気温差によって発生することが多いです。',
           'medium'
    WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text = '乱気流の主な原因はどれですか？');

    -- 2. 航空工学問題 (id: "2")
    SELECT id INTO legacy_deck_id FROM card_decks WHERE title = '既存Exam問題（航空工学）' LIMIT 1;
    INSERT INTO questions (deck_id, question_text, options, correct_option_index, explanation, difficulty_level)
    SELECT legacy_deck_id,
           '現代の商用航空機に最も一般的に使用されている推進システムはどれですか？',
           ARRAY['ジェットエンジン', 'ピストンエンジン', 'ロータリーエンジン', '電気エンジン'],
           0,
           'ジェットエンジンは現代の商用航空機で最も一般的です。',
           'easy'
    WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE '現代の商用航空機に最も一般的%');

    -- 3. 航空法規問題 (id: "3")
    SELECT id INTO legacy_deck_id FROM card_decks WHERE title = '既存Exam問題（航空法規）' LIMIT 1;
    INSERT INTO questions (deck_id, question_text, options, correct_option_index, explanation, difficulty_level)
    SELECT legacy_deck_id,
           '国際民間航空における基本的な規則の制定を行う組織はどれですか？',
           ARRAY['ICAO', 'FAA', 'EASA', 'JAA'],
           0,
           'ICAOは国際民間航空機関として、国際的な航空法規の基準を設定しています。',
           'medium'
    WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE '国際民間航空における基本的な規則%');

    -- 4. 航空通信問題 (id: "4")
    SELECT id INTO legacy_deck_id FROM card_decks WHERE title = '既存Exam問題（通信）' LIMIT 1;
    INSERT INTO questions (deck_id, question_text, options, correct_option_index, explanation, difficulty_level)
    SELECT legacy_deck_id,
           '緊急時に使用される航空無線の標準周波数はどれですか？',
           ARRAY['121.5 MHz', '123.45 MHz', '118 MHz', '135.0 MHz'],
           0,
           '121.5 MHzは国際的に緊急通信用に使用される航空無線周波数です。',
           'hard'
    WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE '緊急時に使用される航空無線%');

    -- 5. 空中航法問題 (id: "5")
    SELECT id INTO legacy_deck_id FROM card_decks WHERE title = '既存Exam問題（航法）' LIMIT 1;
    INSERT INTO questions (deck_id, question_text, options, correct_option_index, explanation, difficulty_level)
    SELECT legacy_deck_id,
           '現代の航空機で最も広く利用されている航法システムはどれですか？',
           ARRAY['GPS', 'VOR', 'INS', 'NDB'],
           0,
           'GPSは全世界で広く利用され、最新の航空機では主要な航法システムです。',
           'easy'
    WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question_text LIKE '現代の航空機で最も広く利用されている航法システム%');

    RAISE NOTICE '既存ExamQuestion問題の移行完了';

END $$; 