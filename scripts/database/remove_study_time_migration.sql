-- ===============================
-- Remove Study Time Feature Migration
-- 学習時間機能の削除
-- ===============================

-- user_learning_profilesテーブルからtotal_study_time_minutesカラムを削除
ALTER TABLE user_learning_profiles
DROP COLUMN IF EXISTS total_study_time_minutes;

-- コメント追加（削除理由を記録）
COMMENT ON TABLE user_learning_profiles IS 'ユーザーの学習プロファイル（学習時間機能は削除済み）';

