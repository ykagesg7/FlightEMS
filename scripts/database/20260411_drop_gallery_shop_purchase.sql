-- Phase 3: Remove gallery / shop / purchase_history (feature paused).
-- Also removes rank_requirements rows and check_rank_requirements branches that referenced dropped tables.
-- Order: view -> tables (FK child first) -> orphan trigger functions.

DELETE FROM public.rank_requirements
WHERE requirement_type IN ('purchases', 'gallery_posts', 'gallery_likes_given');

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
  FOR requirement_record IN
    SELECT * FROM rank_requirements
    WHERE rank = p_rank
    ORDER BY priority, alternative_group NULLS LAST, requirement_type
  LOOP
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
        SELECT COALESCE(
          (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
          0
        ) INTO current_value
        FROM user_test_results
        WHERE user_id = p_user_id;
        requirement_met := current_value >= requirement_record.requirement_value;

      WHEN 'streak_days' THEN
        SELECT current_streak INTO current_value
        FROM streak_records
        WHERE user_id = p_user_id;
        requirement_met := COALESCE(current_value, 0) >= requirement_record.requirement_value;

      ELSE
        requirement_met := false;
    END CASE;

    IF requirement_record.alternative_group IS NOT NULL THEN
      IF group_satisfied ? requirement_record.alternative_group THEN
        requirement_met := true;
      ELSE
        group_satisfied := group_satisfied || jsonb_build_object(
          requirement_record.alternative_group,
          requirement_met
        );
      END IF;
    END IF;

    IF requirement_record.is_required AND NOT requirement_met THEN
      all_requirements_met := false;
    END IF;

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

  FOR requirement_record IN
    SELECT DISTINCT alternative_group FROM rank_requirements
    WHERE rank = p_rank AND alternative_group IS NOT NULL
  LOOP
    NULL;
  END LOOP;

  SELECT json_build_object(
    'all_requirements_met', all_requirements_met,
    'requirements', requirement_status,
    'rank', p_rank
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

DROP VIEW IF EXISTS public.fan_photo_like_counts CASCADE;

DROP TABLE IF EXISTS public.fan_photo_likes CASCADE;
DROP TABLE IF EXISTS public.fan_photos CASCADE;
DROP TABLE IF EXISTS public.gallery_events CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.purchase_history CASCADE;

DROP FUNCTION IF EXISTS public.fan_photos_enforce_limit() CASCADE;
DROP FUNCTION IF EXISTS public.fan_photos_set_event_and_check() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_single_active_event() CASCADE;
DROP FUNCTION IF EXISTS public.get_active_event_id() CASCADE;
