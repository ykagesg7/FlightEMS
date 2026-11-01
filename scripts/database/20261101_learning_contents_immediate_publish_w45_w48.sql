-- W45–W48 完成済み7本（IF-1-2 除く）を即公開。上様承認 2026-11-01。
-- 本番未適用。Approve 後に SQL Editor / MCP で適用（この PR では DB を書かない）。
-- syncPublish:false のため cron は is_published を触らない → is_published=true に揃える。
-- FMT-1-8 の title のみ MDX meta と同期（他カラムは触らない）。

BEGIN;

UPDATE learning_contents
SET is_published = true,
    updated_at = NOW()
WHERE id IN (
  'FMT-1-7_TrailFamily',
  'FMT-1-8_Rejoin',
  '1.1.7_SharpenTheSaw',
  'FMT-1-9_TacticalLAB',
  'FMT-1-10_LostWingman',
  'L1-Q4-1_MichizaneBriefing',
  'L1-Q3-1_PathToPilot'
);

UPDATE learning_contents
SET title = '【操縦】第8話：再集合ば救うな ～Pitchout / Rejoin / Overshoot / Breakout～',
    updated_at = NOW()
WHERE id = 'FMT-1-8_Rejoin';

COMMIT;
