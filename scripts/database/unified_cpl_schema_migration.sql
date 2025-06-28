-- CPL試験データ統一スキーマ移行スクリプト
-- 作成日: 2025年6月21日
-- 目的: 公式出題範囲に基づく統一データベーススキーマの実装

-- ===============================
-- 1. 統一CPL問題テーブル作成
-- ===============================

CREATE TABLE IF NOT EXISTS unified_cpl_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 公式科目分類（国土交通省航空局準拠）
    main_subject varchar(20) NOT NULL CHECK (main_subject IN (
        '航空工学', '航空気象', '空中航法', '航空通信', '航空法規'
    )),
    sub_subject varchar(100) NOT NULL,   -- サブカテゴリ（出題範囲準拠）
    detailed_topic varchar(200),         -- 詳細項目
    
    -- 問題内容
    question_text text NOT NULL,
    options jsonb NOT NULL,              -- 4選択肢をJSON配列で格納
    correct_answer integer NOT NULL CHECK (correct_answer BETWEEN 1 AND 4),
    explanation text,
    
    -- 出典メタデータ（強化版）
    source_documents jsonb NOT NULL DEFAULT '{"sources": [], "weight": 1.0, "originality": "original"}',
    /*
    JSON構造例:
    {
        "sources": [
            {"type": "official_exam", "year": 2022, "month": 9, "question_num": 15, "file": "202209_CPLTest.pdf"},
            {"type": "practice_quiz", "deck": "航空気象基礎", "original": true, "category": "航空気象"},
            {"type": "converted_pdf", "file": "202301_CPLTest.pdf", "page": 3, "extraction_confidence": 0.95}
        ],
        "weight": 2.5,
        "originality": "multiple_source",
        "duplicate_count": 2,
        "first_appearance": {"year": 2022, "month": 9}
    }
    */
    
    -- 品質・重要度メタデータ
    difficulty_level integer CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 3,
    importance_score decimal(5,2) DEFAULT 5.0,    -- 1.0-10.0スケール
    appearance_frequency integer DEFAULT 0,        -- 過去出題回数
    
    -- 検証・品質管理
    verification_status varchar(20) DEFAULT 'pending' CHECK (
        verification_status IN ('pending', 'verified', 'needs_review', 'duplicate', 'rejected')
    ),
    quality_score decimal(3,2) DEFAULT 0.80,      -- 品質スコア（0.0-1.0）
    
    -- 重複管理
    duplicate_group_id uuid,                       -- 同一問題グループID
    is_canonical boolean DEFAULT false,            -- 代表問題フラグ
    similarity_score decimal(3,2),                 -- 類似度スコア
    
    -- タグ・分類支援
    tags text[] DEFAULT '{}',                      -- フリータグ
    exam_type varchar(50) DEFAULT 'CPL',          -- 試験種別
    
    -- タイムスタンプ
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    
    -- 制約・インデックス
    UNIQUE(main_subject, sub_subject, question_text, correct_answer)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_unified_main_subject ON unified_cpl_questions(main_subject);
CREATE INDEX IF NOT EXISTS idx_unified_sub_subject ON unified_cpl_questions(sub_subject);
CREATE INDEX IF NOT EXISTS idx_unified_difficulty ON unified_cpl_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_unified_importance ON unified_cpl_questions(importance_score);
CREATE INDEX IF NOT EXISTS idx_unified_verification ON unified_cpl_questions(verification_status);
CREATE INDEX IF NOT EXISTS idx_unified_duplicate_group ON unified_cpl_questions(duplicate_group_id);
CREATE INDEX IF NOT EXISTS idx_unified_canonical ON unified_cpl_questions(is_canonical);
CREATE INDEX IF NOT EXISTS idx_unified_source_docs ON unified_cpl_questions USING gin(source_documents);

-- ===============================
-- 2. 科目マッピング関数
-- ===============================

-- quiz_questions科目名を公式科目名に変換
CREATE OR REPLACE FUNCTION map_quiz_subject_to_official(quiz_subject text)
RETURNS TABLE(main_subject text, sub_subject text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN quiz_subject = '航空通信' THEN '航空通信'
            WHEN quiz_subject = '航法' THEN '空中航法'
            WHEN quiz_subject = '緊急操作と異常事態対応' THEN '空中航法'
            WHEN quiz_subject = '飛行規則' THEN '航空法規'
            WHEN quiz_subject = '人間工学・CRM' THEN '空中航法'
            WHEN quiz_subject = '航空機の構造とシステム' THEN '航空工学'
            WHEN quiz_subject = '航空機の運用' THEN '航空工学'
            WHEN quiz_subject = '航空気象' THEN '航空気象'
            WHEN quiz_subject = '航空力学' THEN '航空工学'
            WHEN quiz_subject = '安全管理とリスク評価' THEN '空中航法'
            ELSE '航空工学'  -- デフォルト
        END::text,
        CASE 
            WHEN quiz_subject = '航空通信' THEN '航空交通業務'
            WHEN quiz_subject = '航法' THEN '航法'
            WHEN quiz_subject = '緊急操作と異常事態対応' THEN '人間の能力及び限界に関する一般知識'
            WHEN quiz_subject = '飛行規則' THEN '航空法及び航空法施行規則'
            WHEN quiz_subject = '人間工学・CRM' THEN '人間の能力及び限界に関する一般知識'
            WHEN quiz_subject = '航空機の構造とシステム' THEN '航空機構造'
            WHEN quiz_subject = '航空機の運用' THEN '航空機装備'
            WHEN quiz_subject = '航空気象' THEN '大気の物理'
            WHEN quiz_subject = '航空力学' THEN '航空力学'
            WHEN quiz_subject = '安全管理とリスク評価' THEN '人間の能力及び限界に関する一般知識'
            ELSE '航空力学'  -- デフォルト
        END::text;
END;
$$ LANGUAGE plpgsql;

-- exam_questions_metadata科目名を公式科目名に変換
CREATE OR REPLACE FUNCTION map_exam_subject_to_official(exam_subject text)
RETURNS TABLE(main_subject text, sub_subject text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN exam_subject = '航空気象' THEN '航空気象'
            WHEN exam_subject = '航空工学' THEN '航空工学'
            WHEN exam_subject = '航空法規' THEN '航空法規'
            WHEN exam_subject = '航空通信' THEN '航空通信'
            WHEN exam_subject = '航空機体・発動機' THEN '航空工学'
            ELSE '航空工学'  -- デフォルト
        END::text,
        CASE 
            WHEN exam_subject = '航空気象' THEN '大気の物理'
            WHEN exam_subject = '航空工学' THEN '航空力学'
            WHEN exam_subject = '航空法規' THEN '航空法及び航空法施行規則'
            WHEN exam_subject = '航空通信' THEN '航空交通業務'
            WHEN exam_subject = '航空機体・発動機' THEN '動力装置'
            ELSE '航空力学'  -- デフォルト
        END::text;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 3. 重複検出関数
-- ===============================

-- 問題文の類似度計算（簡易版）
CREATE OR REPLACE FUNCTION calculate_question_similarity(text1 text, text2 text)
RETURNS decimal(3,2) AS $$
DECLARE
    similarity_score decimal(3,2);
    clean_text1 text;
    clean_text2 text;
BEGIN
    -- テキストの正規化
    clean_text1 := regexp_replace(lower(trim(text1)), '[^\w\s]', '', 'g');
    clean_text2 := regexp_replace(lower(trim(text2)), '[^\w\s]', '', 'g');
    
    -- 完全一致チェック
    IF clean_text1 = clean_text2 THEN
        RETURN 1.00;
    END IF;
    
    -- 長さベースの類似度（簡易版）
    similarity_score := 1.0 - (abs(length(clean_text1) - length(clean_text2))::decimal / greatest(length(clean_text1), length(clean_text2)));
    
    -- 共通文字列の割合（簡易版）
    IF position(substring(clean_text1, 1, 50) in clean_text2) > 0 OR 
       position(substring(clean_text2, 1, 50) in clean_text1) > 0 THEN
        similarity_score := similarity_score + 0.2;
    END IF;
    
    RETURN least(similarity_score, 1.00);
END;
$$ LANGUAGE plpgsql;

-- 重複問題検出
CREATE OR REPLACE FUNCTION detect_duplicate_questions()
RETURNS TABLE(
    question1_id uuid,
    question2_id uuid,
    similarity_score decimal(3,2),
    duplicate_type text
) AS $$
BEGIN
    RETURN QUERY
    WITH question_pairs AS (
        SELECT 
            q1.id as q1_id,
            q2.id as q2_id,
            calculate_question_similarity(q1.question_text, q2.question_text) as sim_score,
            q1.main_subject = q2.main_subject as same_subject,
            q1.correct_answer = q2.correct_answer as same_answer
        FROM unified_cpl_questions q1
        CROSS JOIN unified_cpl_questions q2
        WHERE q1.id < q2.id  -- 重複回避
    )
    SELECT 
        q1_id,
        q2_id,
        sim_score,
        CASE 
            WHEN sim_score >= 0.98 AND same_answer THEN 'exact_duplicate'
            WHEN sim_score >= 0.90 AND same_answer AND same_subject THEN 'high_similarity'
            WHEN sim_score >= 0.70 AND same_subject THEN 'partial_similarity'
            ELSE 'no_duplicate'
        END as duplicate_type
    FROM question_pairs
    WHERE sim_score >= 0.70;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 4. 重みづけ計算関数
-- ===============================

CREATE OR REPLACE FUNCTION calculate_question_weight(source_docs jsonb)
RETURNS decimal(5,2) AS $$
DECLARE
    base_weight decimal(5,2) := 1.0;
    source_multiplier decimal(5,2) := 1.0;
    recency_factor decimal(5,2) := 1.0;
    verification_bonus decimal(5,2) := 1.0;
    source_record jsonb;
    source_type text;
    exam_year integer;
    total_weight decimal(5,2);
BEGIN
    -- ソース文書を解析
    FOR source_record IN SELECT jsonb_array_elements(source_docs->'sources')
    LOOP
        source_type := source_record->>'type';
        
        -- ソース種別による重み
        CASE source_type
            WHEN 'official_exam' THEN source_multiplier := source_multiplier * 3.0;
            WHEN 'converted_pdf' THEN source_multiplier := source_multiplier * 2.0;
            WHEN 'practice_quiz' THEN source_multiplier := source_multiplier * 1.5;
            ELSE source_multiplier := source_multiplier * 1.0;
        END CASE;
        
        -- 年度による新しさ重み
        IF source_record ? 'year' THEN
            exam_year := (source_record->>'year')::integer;
            recency_factor := greatest(0.5, (2025 - exam_year)::decimal / 10);
        END IF;
    END LOOP;
    
    -- 検証状態によるボーナス
    IF source_docs->>'originality' = 'verified' THEN
        verification_bonus := 1.2;
    END IF;
    
    -- 重複数による調整
    IF (source_docs->>'duplicate_count')::integer > 1 THEN
        base_weight := base_weight * (1 + (source_docs->>'duplicate_count')::integer * 0.3);
    END IF;
    
    total_weight := base_weight * source_multiplier * recency_factor * verification_bonus;
    
    RETURN least(total_weight, 10.0);  -- 最大重み制限
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 5. データ移行用プロシージャ
-- ===============================

-- quiz_questionsからの移行
CREATE OR REPLACE FUNCTION migrate_quiz_questions()
RETURNS integer AS $$
DECLARE
    migrated_count integer := 0;
    quiz_record record;
    mapped_subjects record;
    source_metadata jsonb;
BEGIN
    FOR quiz_record IN 
        SELECT id, category, question, answer1, answer2, answer3, answer4, correct, explanation
        FROM quiz_questions
        WHERE question IS NOT NULL AND question != ''
    LOOP
        -- 科目マッピング
        SELECT * INTO mapped_subjects FROM map_quiz_subject_to_official(quiz_record.category);
        
        -- ソースメタデータ作成
        source_metadata := jsonb_build_object(
            'sources', jsonb_build_array(
                jsonb_build_object(
                    'type', 'practice_quiz',
                    'original_id', quiz_record.id,
                    'category', quiz_record.category,
                    'original', true
                )
            ),
            'weight', 1.5,
            'originality', 'original'
        );
        
        -- 統一テーブルに挿入
        INSERT INTO unified_cpl_questions (
            main_subject,
            sub_subject,
            question_text,
            options,
            correct_answer,
            explanation,
            source_documents,
            difficulty_level,
            verification_status,
            tags
        ) VALUES (
            mapped_subjects.main_subject,
            mapped_subjects.sub_subject,
            quiz_record.question,
            jsonb_build_array(quiz_record.answer1, quiz_record.answer2, quiz_record.answer3, quiz_record.answer4),
            quiz_record.correct,
            COALESCE(quiz_record.explanation, ''),
            source_metadata,
            3,  -- デフォルト難易度
            'verified',  -- quiz_questionsは検証済みとする
            ARRAY[quiz_record.category]
        )
        ON CONFLICT (main_subject, sub_subject, question_text, correct_answer) DO NOTHING;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- exam_questions_metadataからの移行
CREATE OR REPLACE FUNCTION migrate_exam_questions_metadata()
RETURNS integer AS $$
DECLARE
    migrated_count integer := 0;
    exam_record record;
    mapped_subjects record;
    source_metadata jsonb;
    weight_score decimal(5,2);
BEGIN
    FOR exam_record IN 
        SELECT id, exam_year, exam_month, question_number, subject_category, sub_category,
               difficulty_level, importance_score, source_document, question_text, 
               options, correct_answer, explanation
        FROM exam_questions_metadata
        WHERE question_text IS NOT NULL AND question_text != ''
    LOOP
        -- 科目マッピング
        SELECT * INTO mapped_subjects FROM map_exam_subject_to_official(exam_record.subject_category);
        
        -- ソースメタデータ作成
        source_metadata := jsonb_build_object(
            'sources', jsonb_build_array(
                jsonb_build_object(
                    'type', 'official_exam',
                    'year', exam_record.exam_year,
                    'month', exam_record.exam_month,
                    'question_num', exam_record.question_number,
                    'file', exam_record.source_document,
                    'original_id', exam_record.id
                )
            ),
            'weight', 3.0,
            'originality', 'official',
            'first_appearance', jsonb_build_object('year', exam_record.exam_year, 'month', exam_record.exam_month)
        );
        
        -- 重み計算
        weight_score := calculate_question_weight(source_metadata);
        
        -- 統一テーブルに挿入
        INSERT INTO unified_cpl_questions (
            main_subject,
            sub_subject,
            detailed_topic,
            question_text,
            options,
            correct_answer,
            explanation,
            source_documents,
            difficulty_level,
            importance_score,
            verification_status,
            tags
        ) VALUES (
            mapped_subjects.main_subject,
            mapped_subjects.sub_subject,
            exam_record.sub_category,
            exam_record.question_text,
            exam_record.options,
            exam_record.correct_answer,
            COALESCE(exam_record.explanation, ''),
            source_metadata,
            COALESCE(exam_record.difficulty_level, 3),
            COALESCE(exam_record.importance_score, weight_score),
            'verified',
            ARRAY[exam_record.subject_category, COALESCE(exam_record.sub_category, '')]
        )
        ON CONFLICT (main_subject, sub_subject, question_text, correct_answer) DO NOTHING;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 6. 統計・分析関数
-- ===============================

-- 統一後の統計情報取得
CREATE OR REPLACE FUNCTION get_unified_statistics()
RETURNS TABLE(
    main_subject text,
    sub_subject text,
    question_count bigint,
    avg_difficulty decimal(3,2),
    avg_importance decimal(5,2),
    verified_count bigint,
    duplicate_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ucq.main_subject,
        ucq.sub_subject,
        COUNT(*) as question_count,
        ROUND(AVG(ucq.difficulty_level), 2) as avg_difficulty,
        ROUND(AVG(ucq.importance_score), 2) as avg_importance,
        COUNT(*) FILTER (WHERE ucq.verification_status = 'verified') as verified_count,
        COUNT(*) FILTER (WHERE ucq.duplicate_group_id IS NOT NULL) as duplicate_count
    FROM unified_cpl_questions ucq
    GROUP BY ucq.main_subject, ucq.sub_subject
    ORDER BY ucq.main_subject, ucq.sub_subject;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- 7. 公式科目マスタデータ
-- ===============================

-- 公式科目・サブ科目マスタデータ
CREATE TABLE IF NOT EXISTS cpl_subject_master (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    main_subject varchar(20) NOT NULL,
    sub_subject varchar(100) NOT NULL,
    display_order integer NOT NULL,
    description text,
    created_at timestamp DEFAULT now(),
    UNIQUE(main_subject, sub_subject)
);

-- 公式科目マスタデータ挿入
INSERT INTO cpl_subject_master (main_subject, sub_subject, display_order, description) VALUES
-- 航空工学
('航空工学', '航空力学', 101, '空力の基礎理論、性能と耐空性'),
('航空工学', '航空機構造', 102, '航空機材料、機体の構造'),
('航空工学', '航空機装備', 103, '着陸装置、燃料供給系統、空調系統等'),
('航空工学', '動力装置', 104, 'ピストン・エンジン、タービン・エンジン'),
('航空工学', '無線工学', 105, '航空機電気系統、電波の伝播、無線通信'),
('航空工学', '航空計器', 106, '航空計器一般、姿勢表示計器、航法計器等'),
('航空工学', '重量、重心位置', 107, '重量・重心位置の測定と算出'),

-- 航空気象
('航空気象', '大気の物理', 201, '大気の基礎、雲と霧'),
('航空気象', '大気の運動', 202, '風、気団、前線、高気圧と低気圧、熱帯気象'),
('航空気象', '高層気象と気象障害', 203, '高層気象、乱気流、ウィンドシャー、雷雲等'),
('航空気象', '気象情報', 204, '気象通報、天気図'),

-- 空中航法
('空中航法', '航法', 301, '航法の種類、航法計画書の作成、航法の実施'),
('空中航法', '運航方式に関する一般知識', 302, '有視界飛行方式、空域、航空情報等'),
('空中航法', '人間の能力及び限界に関する一般知識', 303, '環境と人間の能力、空間識失調、航空心理学'),

-- 航空通信
('航空通信', '航空交通業務', 401, '航空交通業務概論、捜索救難業務、航空情報業務、飛行計画、航空通信'),
('航空通信', '管制業務', 402, 'クリアランス、管制業務一般、飛行場管制、飛行管制、レーダー管制等'),

-- 航空法規
('航空法規', '国際条約', 501, '国際民間航空条約（シカゴ条約）'),
('航空法規', '航空法及び航空法施行規則', 502, '総則、登録、航空機の安全性、航空従事者、航空機の運航等')

ON CONFLICT (main_subject, sub_subject) DO NOTHING;

-- ===============================
-- 8. 実行ログ・完了処理
-- ===============================

-- 移行実行ログテーブル
CREATE TABLE IF NOT EXISTS migration_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name varchar(100) NOT NULL,
    start_time timestamp DEFAULT now(),
    end_time timestamp,
    status varchar(20) DEFAULT 'running',
    records_processed integer DEFAULT 0,
    errors_count integer DEFAULT 0,
    notes text
);

-- 移行実行記録
INSERT INTO migration_log (migration_name, notes) 
VALUES ('unified_cpl_schema_migration', 'CPL試験データ統一スキーマ移行スクリプト実行開始');

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '=== CPL試験データ統一スキーマ移行スクリプト実行完了 ===';
    RAISE NOTICE '作成されたテーブル: unified_cpl_questions, cpl_subject_master';
    RAISE NOTICE '作成された関数: 科目マッピング、重複検出、重みづけ計算、データ移行';
    RAISE NOTICE '次のステップ: migrate_quiz_questions(), migrate_exam_questions_metadata() を実行';
END $$; 