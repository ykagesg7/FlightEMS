-- ===============================
-- Whisky Papa Rank Requirements - 初期データ
-- ランク条件の初期設定
-- ===============================

-- ウイングマンランクの条件（複数条件）
-- XP条件
INSERT INTO rank_requirements (rank, requirement_type, requirement_value, requirement_config, is_required, priority, display_name, description, icon)
VALUES
  ('wingman', 'xp', 600, NULL, true, 1, '経験値', '600 XP以上', '⭐'),

  -- 記事読了条件
  ('wingman', 'articles_read', 30, NULL, true, 2, '記事読了', '30記事以上読了', '📚'),

  -- 試験パス条件（全科目80%以上）
  ('wingman', 'exam_score', 80, '{"all_subjects": true}'::JSONB, true, 3, '試験合格', '全科目で80%以上の正答率', '📝'),

  -- ロイヤリティ条件（OR条件: 購買3回以上 OR ストリーク30日以上）
  ('wingman', 'purchases', 3, '{"purchase_type": "shop"}'::JSONB, true, 4, 'ロイヤリティ（購買）', '3回以上の購買', '🛒'),
  ('wingman', 'streak_days', 30, NULL, true, 4, 'ロイヤリティ（継続）', '30日連続学習', '🔥')
ON CONFLICT (rank, requirement_type) DO NOTHING;

-- ウイングマンランクのロイヤリティ条件をORグループとして設定
-- 注意: alternative_groupは後でUPDATEする必要があります
UPDATE rank_requirements
SET alternative_group = 'wingman_loyalty'
WHERE rank = 'wingman'
  AND requirement_type IN ('purchases', 'streak_days')
  AND priority = 4;

-- その他のランクの条件（XPのみ、シンプルな設計）
-- 各ランクのXP条件は自動的にcheck_rank_up関数で処理されるため、
-- 特別な条件は設定しません（必要に応じて追加可能）

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== Rank Requirements Initial Data 完了 ===';
  RAISE NOTICE 'ウイングマンランクの条件を設定しました:';
  RAISE NOTICE '  - XP: 600以上';
  RAISE NOTICE '  - 記事読了: 30記事以上';
  RAISE NOTICE '  - 試験パス: 全科目80%以上';
  RAISE NOTICE '  - ロイヤリティ: 購買3回以上 OR ストリーク30日以上';
END $$;

