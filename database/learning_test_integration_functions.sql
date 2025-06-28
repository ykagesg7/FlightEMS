-- Learning-Test連携システム用PostgreSQL関数群

-- ===============================
-- 1. ユーザー弱点領域の更新関数
-- ===============================

CREATE OR REPLACE FUNCTION update_user_weak_areas(
    p_user_id UUID,
    p_subject_category VARCHAR,
    p_accuracy_rate DECIMAL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_weak_areas (
        user_id, subject_category, accuracy_rate, 
        attempt_count, last_updated, improvement_trend,
        priority_level
    ) 
    VALUES (
        p_user_id, p_subject_category, p_accuracy_rate,
        1, NOW(), 'stable',
        CASE 
            WHEN p_accuracy_rate < 50 THEN 10
            WHEN p_accuracy_rate < 70 THEN 7
            WHEN p_accuracy_rate < 80 THEN 5
            ELSE 3
        END
    )
    ON CONFLICT (user_id, subject_category) 
    DO UPDATE SET
        accuracy_rate = (
            (user_weak_areas.accuracy_rate * user_weak_areas.attempt_count + p_accuracy_rate) 
            / (user_weak_areas.attempt_count + 1)
        ),
        attempt_count = user_weak_areas.attempt_count + 1,
        last_updated = NOW(),
        improvement_trend = CASE
            WHEN p_accuracy_rate > user_weak_areas.accuracy_rate + 5 THEN 'improving'
            WHEN p_accuracy_rate < user_weak_areas.accuracy_rate - 5 THEN 'declining'
            ELSE 'stable'
        END,
        priority_level = CASE 
            WHEN ((user_weak_areas.accuracy_rate * user_weak_areas.attempt_count + p_accuracy_rate) 
                  / (user_weak_areas.attempt_count + 1)) < 50 THEN 10
            WHEN ((user_weak_areas.accuracy_rate * user_weak_areas.attempt_count + p_accuracy_rate) 
                  / (user_weak_areas.attempt_count + 1)) < 70 THEN 7
            WHEN ((user_weak_areas.accuracy_rate * user_weak_areas.attempt_count + p_accuracy_rate) 
                  / (user_weak_areas.attempt_count + 1)) < 80 THEN 5
            ELSE 3
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 2. ユーザー総合正答率計算関数
-- ===============================

CREATE OR REPLACE FUNCTION calculate_user_overall_accuracy(
    p_user_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    overall_accuracy DECIMAL;
BEGIN
    SELECT COALESCE(AVG(overall_accuracy), 0)
    INTO overall_accuracy
    FROM cpl_exam_sessions 
    WHERE user_id = p_user_id
      AND completed_at IS NOT NULL
      AND created_at >= NOW() - INTERVAL '30 days';
    
    RETURN ROUND(overall_accuracy, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 3. 学習連続日数計算関数
-- ===============================

CREATE OR REPLACE FUNCTION calculate_learning_streak(
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE;
    has_activity BOOLEAN;
BEGIN
    -- 最大100日まで遡って連続学習日数を計算
    FOR i IN 0..99 LOOP
        check_date := current_date - i;
        
        -- その日に学習活動があったかチェック
        SELECT EXISTS (
            SELECT 1 FROM learning_sessions 
            WHERE user_id = p_user_id 
              AND DATE(created_at) = check_date
              AND session_duration > 300 -- 5分以上の学習
            UNION
            SELECT 1 FROM cpl_exam_sessions
            WHERE user_id = p_user_id
              AND DATE(created_at) = check_date
              AND completed_at IS NOT NULL
            UNION
            SELECT 1 FROM progress
            WHERE user_id = p_user_id
              AND DATE(last_read_date) = check_date
        ) INTO has_activity;
        
        IF has_activity THEN
            streak_count := streak_count + 1;
        ELSE
            -- 連続記録が途切れた場合
            EXIT;
        END IF;
    END LOOP;
    
    RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 4. 個人化学習パス生成関数
-- ===============================

CREATE OR REPLACE FUNCTION generate_personalized_learning_path(
    p_user_id UUID,
    p_target_exam_date DATE DEFAULT NULL,
    p_weak_area_focus BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    sequence_order INTEGER,
    content_id VARCHAR,
    content_title VARCHAR,
    content_category VARCHAR,
    estimated_study_time INTEGER,
    priority_score DECIMAL,
    reasoning TEXT,
    prerequisite_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH user_weak_subjects AS (
        SELECT subject_category, accuracy_rate, priority_level
        FROM user_weak_areas 
        WHERE user_id = p_user_id
          AND accuracy_rate < 80
        ORDER BY priority_level DESC, accuracy_rate ASC
    ),
    available_content AS (
        SELECT 
            ltm.learning_content_id,
            ltm.content_title,
            ltm.content_category,
            ltm.estimated_study_time,
            ltm.difficulty_level,
            ltm.subject_area,
            uws.priority_level,
            uws.accuracy_rate,
            COALESCE(p.completed, false) as is_completed,
            CASE 
                WHEN p_weak_area_focus AND uws.subject_category IS NOT NULL THEN
                    (100 - uws.accuracy_rate) * ltm.weight_score * 1.5
                ELSE
                    ltm.weight_score * 10
            END as calculated_priority
        FROM learning_test_mapping ltm
        LEFT JOIN user_weak_subjects uws ON uws.subject_category = ltm.subject_area
        LEFT JOIN progress p ON p.content_id = ltm.learning_content_id AND p.user_id = p_user_id
        WHERE ltm.verification_status = 'verified'
          AND (NOT p_weak_area_focus OR uws.subject_category IS NOT NULL OR ltm.relationship_type = 'prerequisite')
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY ac.calculated_priority DESC, ac.difficulty_level ASC)::INTEGER,
        ac.learning_content_id,
        ac.content_title,
        ac.content_category,
        ac.estimated_study_time,
        ac.calculated_priority,
        CASE 
            WHEN ac.accuracy_rate IS NOT NULL THEN
                CONCAT('弱点科目（正答率', ac.accuracy_rate::TEXT, '%）の理解向上のため')
            WHEN ltm.relationship_type = 'prerequisite' THEN
                '基礎知識として重要な内容のため'
            ELSE
                '総合的な理解向上のため'
        END,
        NOT ac.is_completed
    FROM available_content ac
    JOIN learning_test_mapping ltm ON ltm.learning_content_id = ac.learning_content_id
    WHERE NOT ac.is_completed OR ac.accuracy_rate < 70
    ORDER BY ac.calculated_priority DESC, ac.difficulty_level ASC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 5. テスト結果に基づく学習推奨生成関数
-- ===============================

CREATE OR REPLACE FUNCTION generate_test_based_recommendations(
    p_user_id UUID,
    p_test_session_id UUID,
    p_recommendation_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    content_id VARCHAR,
    content_title VARCHAR,
    recommendation_reason TEXT,
    priority_score DECIMAL,
    estimated_impact DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH test_results AS (
        SELECT 
            ces.overall_accuracy,
            ces.subject_breakdown,
            array_agg(csr.question_id) as incorrect_questions
        FROM cpl_exam_sessions ces
        LEFT JOIN cpl_session_results csr ON csr.session_id = ces.id AND csr.is_correct = false
        WHERE ces.id = p_test_session_id AND ces.user_id = p_user_id
        GROUP BY ces.id, ces.overall_accuracy, ces.subject_breakdown
    ),
    weak_subjects AS (
        SELECT 
            key as subject_name,
            (value->>'accuracy')::DECIMAL as subject_accuracy
        FROM test_results tr,
        LATERAL jsonb_each(tr.subject_breakdown) 
        WHERE (value->>'accuracy')::DECIMAL < 70
    ),
    related_content AS (
        SELECT DISTINCT
            ltm.learning_content_id,
            ltm.content_title,
            ltm.subject_area,
            ltm.weight_score,
            ltm.estimated_study_time,
            ws.subject_accuracy,
            (70 - ws.subject_accuracy) * ltm.weight_score as calculated_priority
        FROM learning_test_mapping ltm
        JOIN weak_subjects ws ON ws.subject_name = ltm.subject_area
        WHERE ltm.verification_status = 'verified'
        ORDER BY calculated_priority DESC
    )
    SELECT 
        rc.learning_content_id,
        rc.content_title,
        CONCAT('テストで', rc.subject_area, 'の正答率が', rc.subject_accuracy::TEXT, '%のため復習推奨'),
        rc.calculated_priority,
        LEAST(90.0, rc.subject_accuracy + 25) -- 最大90%まで改善を想定
    FROM related_content rc
    LIMIT p_recommendation_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 6. 学習効果予測関数
-- ===============================

CREATE OR REPLACE FUNCTION predict_learning_effectiveness(
    p_user_id UUID,
    p_content_id VARCHAR,
    p_current_accuracy DECIMAL DEFAULT NULL
)
RETURNS TABLE (
    predicted_improvement DECIMAL,
    confidence_level DECIMAL,
    estimated_study_time INTEGER,
    success_probability DECIMAL
) AS $$
DECLARE
    user_learning_velocity DECIMAL;
    content_difficulty INTEGER;
    content_effectiveness DECIMAL;
    base_improvement DECIMAL;
BEGIN
    -- ユーザーの学習速度を計算
    SELECT COALESCE(AVG(
        CASE 
            WHEN ls.session_duration > 0 THEN 
                (post_accuracy - pre_accuracy) / (ls.session_duration / 60.0)
            ELSE 0
        END
    ), 0.1) INTO user_learning_velocity
    FROM learning_sessions ls
    WHERE ls.user_id = p_user_id
      AND ls.created_at >= NOW() - INTERVAL '30 days'
      AND ls.session_duration > 0;

    -- コンテンツの難易度と効果を取得
    SELECT 
        ltm.difficulty_level,
        ltm.confidence_score
    INTO content_difficulty, content_effectiveness
    FROM learning_test_mapping ltm
    WHERE ltm.learning_content_id = p_content_id;

    -- 基本改善率を計算
    base_improvement := CASE
        WHEN p_current_accuracy IS NULL THEN 15.0
        WHEN p_current_accuracy < 50 THEN 20.0
        WHEN p_current_accuracy < 70 THEN 15.0
        WHEN p_current_accuracy < 80 THEN 10.0
        ELSE 5.0
    END;

    RETURN QUERY SELECT 
        base_improvement * content_effectiveness * (1 + user_learning_velocity),
        content_effectiveness * 100,
        COALESCE((SELECT estimated_study_time FROM learning_test_mapping WHERE learning_content_id = p_content_id), 30),
        CASE
            WHEN content_effectiveness > 0.8 THEN 85.0
            WHEN content_effectiveness > 0.6 THEN 70.0
            WHEN content_effectiveness > 0.4 THEN 55.0
            ELSE 40.0
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- 7. 学習進捗同期関数
-- ===============================

CREATE OR REPLACE FUNCTION sync_learning_progress(
    p_user_id UUID,
    p_content_id VARCHAR,
    p_session_type VARCHAR,
    p_session_duration INTEGER DEFAULT NULL,
    p_completion_rate DECIMAL DEFAULT NULL,
    p_test_accuracy DECIMAL DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- 学習セッション記録
    INSERT INTO learning_sessions (
        user_id, content_id, session_type, session_duration,
        content_type, session_metadata, created_at
    ) VALUES (
        p_user_id, p_content_id, p_session_type, COALESCE(p_session_duration, 0),
        CASE WHEN p_session_type = 'testing' THEN 'test' ELSE 'article' END,
        jsonb_build_object(
            'completion_rate', COALESCE(p_completion_rate, 0),
            'test_accuracy', p_test_accuracy,
            'sync_timestamp', EXTRACT(EPOCH FROM NOW())
        ),
        NOW()
    );

    -- プログレス更新
    IF p_completion_rate >= 100 OR p_session_type = 'testing' THEN
        INSERT INTO progress (user_id, content_id, completed, last_read_position, last_read_date)
        VALUES (p_user_id, p_content_id, true, 100, NOW())
        ON CONFLICT (user_id, content_id)
        DO UPDATE SET
            completed = true,
            last_read_position = 100,
            last_read_date = NOW();
    END IF;

    -- テスト結果に基づく弱点更新
    IF p_test_accuracy IS NOT NULL THEN
        -- 対象科目を特定して弱点データを更新
        PERFORM update_user_weak_areas(
            p_user_id,
            ltm.subject_area,
            p_test_accuracy
        )
        FROM learning_test_mapping ltm
        WHERE ltm.learning_content_id = p_content_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================
-- インデックスとパフォーマンス最適化
-- ===============================

-- 学習セッションのインデックス
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_date 
ON learning_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_content_type
ON learning_sessions(content_id, session_type);

-- 弱点領域のインデックス
CREATE INDEX IF NOT EXISTS idx_user_weak_areas_priority
ON user_weak_areas(user_id, priority_level DESC);

CREATE INDEX IF NOT EXISTS idx_user_weak_areas_accuracy
ON user_weak_areas(user_id, accuracy_rate ASC);

-- 学習推奨のインデックス
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_active
ON learning_recommendations(user_id, is_active, priority_score DESC);

-- ===============================
-- 権限設定
-- ===============================

-- 認証されたユーザーに関数実行権限を付与
GRANT EXECUTE ON FUNCTION update_user_weak_areas TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_overall_accuracy TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_learning_streak TO authenticated;
GRANT EXECUTE ON FUNCTION generate_personalized_learning_path TO authenticated;
GRANT EXECUTE ON FUNCTION generate_test_based_recommendations TO authenticated;
GRANT EXECUTE ON FUNCTION predict_learning_effectiveness TO authenticated;
GRANT EXECUTE ON FUNCTION sync_learning_progress TO authenticated;

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_recommendations ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみアクセス可能
CREATE POLICY learning_sessions_user_policy ON learning_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_weak_areas_user_policy ON user_weak_areas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY learning_recommendations_user_policy ON learning_recommendations
    FOR ALL USING (auth.uid() = user_id); 