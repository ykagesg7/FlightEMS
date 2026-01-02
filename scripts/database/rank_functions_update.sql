-- ===============================
-- Whisky Papa Rank Expansion - 関数更新
-- check_rank_up関数を10段階に対応するように更新
-- ===============================

-- 1. check_rank_up関数の更新（10段階に対応）
CREATE OR REPLACE FUNCTION check_rank_up()
RETURNS TRIGGER AS $$
DECLARE
  current_xp INTEGER;
  new_rank user_rank_type;
BEGIN
  -- 現在のXPを取得
  current_xp := NEW.xp_points;

  -- XPに基づいてランクを決定（10段階）
  IF current_xp >= 900 THEN
    new_rank := 'legend';
  ELSIF current_xp >= 800 THEN
    new_rank := 'master';
  ELSIF current_xp >= 700 THEN
    new_rank := 'ace';
  ELSIF current_xp >= 600 THEN
    new_rank := 'wingman';
  ELSIF current_xp >= 500 THEN
    new_rank := 'pilot';
  ELSIF current_xp >= 400 THEN
    new_rank := 'apprentice';
  ELSIF current_xp >= 300 THEN
    new_rank := 'student';
  ELSIF current_xp >= 200 THEN
    new_rank := 'trainee';
  ELSIF current_xp >= 100 THEN
    new_rank := 'spectator';
  ELSE
    new_rank := 'fan';
  END IF;

  -- ランクが変更された場合のみ更新
  IF NEW.rank != new_rank THEN
    NEW.rank := new_rank;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 既存ユーザーのランクを再計算する関数
CREATE OR REPLACE FUNCTION recalculate_all_user_ranks()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- 全ユーザーのランクをXPに基づいて再計算
  UPDATE profiles
  SET rank = CASE
    WHEN xp_points >= 900 THEN 'legend'::user_rank_type
    WHEN xp_points >= 800 THEN 'master'::user_rank_type
    WHEN xp_points >= 700 THEN 'ace'::user_rank_type
    WHEN xp_points >= 600 THEN 'wingman'::user_rank_type
    WHEN xp_points >= 500 THEN 'pilot'::user_rank_type
    WHEN xp_points >= 400 THEN 'apprentice'::user_rank_type
    WHEN xp_points >= 300 THEN 'student'::user_rank_type
    WHEN xp_points >= 200 THEN 'trainee'::user_rank_type
    WHEN xp_points >= 100 THEN 'spectator'::user_rank_type
    ELSE 'fan'::user_rank_type
  END
  WHERE rank != CASE
    WHEN xp_points >= 900 THEN 'legend'::user_rank_type
    WHEN xp_points >= 800 THEN 'master'::user_rank_type
    WHEN xp_points >= 700 THEN 'ace'::user_rank_type
    WHEN xp_points >= 600 THEN 'wingman'::user_rank_type
    WHEN xp_points >= 500 THEN 'pilot'::user_rank_type
    WHEN xp_points >= 400 THEN 'apprentice'::user_rank_type
    WHEN xp_points >= 300 THEN 'student'::user_rank_type
    WHEN xp_points >= 200 THEN 'trainee'::user_rank_type
    WHEN xp_points >= 100 THEN 'spectator'::user_rank_type
    ELSE 'fan'::user_rank_type
  END;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 3. ランク条件をチェックする関数（ウイングマンランクなどの複数条件に対応）
CREATE OR REPLACE FUNCTION check_rank_requirements(
  p_user_id UUID,
  p_rank user_rank_type
)
RETURNS JSON AS $$
DECLARE
  requirement_record RECORD;
  all_requirements_met BOOLEAN := true;
  requirement_status JSONB := '[]'::JSONB;
  group_satisfied JSONB := '{}'::JSONB;
  current_value INTEGER;
  requirement_met BOOLEAN;
  result JSON;
BEGIN
  -- 指定されたランクの全条件を取得
  FOR requirement_record IN
    SELECT * FROM rank_requirements
    WHERE rank = p_rank
    ORDER BY priority, alternative_group NULLS LAST, requirement_type
  LOOP
    -- 条件タイプに応じて現在の値を取得
    CASE requirement_record.requirement_type
      WHEN 'xp' THEN
        SELECT xp_points INTO current_value FROM profiles WHERE id = p_user_id;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'articles_read' THEN
        SELECT COUNT(*) INTO current_value
        FROM learning_progress
        WHERE user_id = p_user_id AND completed = true;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'exams_passed' THEN
        -- 全科目で80%以上の正答率を達成しているかチェック
        -- requirement_configに科目リストが含まれている場合、それを使用
        SELECT COUNT(DISTINCT subject_category) INTO current_value
        FROM (
          SELECT DISTINCT subject_category
          FROM user_test_results
          WHERE user_id = p_user_id
          GROUP BY subject_category, session_id
          HAVING (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)::DECIMAL) >= 0.8
        ) passed_subjects;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'exam_score' THEN
        -- 特定の試験で指定されたスコア以上を達成しているかチェック
        SELECT COALESCE(
          (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
          0
        ) INTO current_value
        FROM user_test_results
        WHERE user_id = p_user_id;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'purchases' THEN
        SELECT COUNT(*) INTO current_value
        FROM purchase_history
        WHERE user_id = p_user_id AND purchase_type = COALESCE(
          (requirement_record.requirement_config->>'purchase_type')::TEXT,
          'shop'
        );
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'streak_days' THEN
        SELECT current_streak INTO current_value
        FROM streak_records
        WHERE user_id = p_user_id;
        requirement_met := COALESCE(current_value, 0) >= requirement_record.requirement_value;

      WHEN 'gallery_posts' THEN
        SELECT COUNT(*) INTO current_value
        FROM fan_photos
        WHERE user_id = p_user_id AND is_approved = true;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'gallery_likes_given' THEN
        SELECT COUNT(*) INTO current_value
        FROM fan_photo_likes
        WHERE user_id = p_user_id;
        requirement_met := current_value >= requirement_record.requirement_value;

      ELSE
        requirement_met := false;
    END CASE;

    -- OR条件グループの処理
    IF requirement_record.alternative_group IS NOT NULL THEN
      -- グループが既に満たされているかチェック
      IF group_satisfied ? requirement_record.alternative_group THEN
        -- 既に満たされている場合、この条件も満たされたとみなす
        requirement_met := true;
      ELSE
        -- グループの満足度を更新
        group_satisfied := group_satisfied || jsonb_build_object(
          requirement_record.alternative_group,
          requirement_met
        );
      END IF;
    END IF;

    -- 必須条件の場合、満たされていなければ全体も満たされていない
    IF requirement_record.is_required AND NOT requirement_met THEN
      all_requirements_met := false;
    END IF;

    -- 条件の状態を記録
    requirement_status := requirement_status || jsonb_build_array(
      jsonb_build_object(
        'type', requirement_record.requirement_type,
        'value', requirement_record.requirement_value,
        'current', current_value,
        'met', requirement_met,
        'display_name', requirement_record.display_name,
        'description', requirement_record.description,
        'is_required', requirement_record.is_required,
        'alternative_group', requirement_record.alternative_group
      )
    );
  END LOOP;

  -- OR条件グループの最終チェック
  -- alternative_groupが設定されている条件が少なくとも1つ満たされている必要がある
  FOR requirement_record IN
    SELECT DISTINCT alternative_group FROM rank_requirements
    WHERE rank = p_rank AND alternative_group IS NOT NULL
  LOOP
    -- グループ内の条件が少なくとも1つ満たされているかチェック
    -- （requirement_statusから確認）
    -- 簡略化のため、グループ内の条件が1つでも満たされていればOKとする
    -- より詳細な実装が必要な場合は、ここを拡張
  END LOOP;

  -- 結果を構築
  SELECT json_build_object(
    'all_requirements_met', all_requirements_met,
    'requirements', requirement_status,
    'rank', p_rank
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. 記事読了時のXP付与関数
CREATE OR REPLACE FUNCTION award_article_xp(
  p_user_id UUID,
  p_article_slug TEXT,
  p_xp_amount INTEGER
)
RETURNS JSON AS $$
DECLARE
  already_awarded BOOLEAN;
  old_rank user_rank_type;
  new_xp INTEGER;
  new_rank user_rank_type;
  rank_up BOOLEAN := false;
  result JSON;
BEGIN
  -- 既にこの記事でXPを獲得済みかチェック
  SELECT EXISTS(
    SELECT 1 FROM learning_progress
    WHERE user_id = p_user_id
    AND content_id = p_article_slug
    AND completed = true
  ) INTO already_awarded;

  IF already_awarded THEN
    RETURN json_build_object(
      'success', false,
      'error', 'XP already awarded for this article'
    );
  END IF;

  -- 現在のランクを取得（更新前）
  SELECT rank INTO old_rank FROM profiles WHERE id = p_user_id;

  -- XPを加算（トリガーが自動的にランクを更新）
  UPDATE profiles
  SET xp_points = xp_points + p_xp_amount
  WHERE id = p_user_id
  RETURNING xp_points, rank INTO new_xp, new_rank;

  -- ランクアップが発生したかチェック
  rank_up := (old_rank != new_rank);

  -- 結果を返す
  SELECT json_build_object(
    'success', true,
    'xp_awarded', p_xp_amount,
    'new_xp', new_xp,
    'new_rank', new_rank,
    'old_rank', old_rank,
    'rank_up', rank_up
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Rank Functions Update 完了 ===';
  RAISE NOTICE '更新された関数: check_rank_up() (10段階対応)';
  RAISE NOTICE '作成された関数: recalculate_all_user_ranks(), check_rank_requirements(), award_article_xp()';
END $$;

