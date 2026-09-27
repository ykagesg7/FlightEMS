-- Re-withhold ７つの習慣 2–7; keep habit 1 published for series restart 2026-09-27 (JST).
-- Does not touch other learning_contents rows. Apply manually (not from agent on production).

UPDATE learning_contents
SET is_published = true, updated_at = NOW()
WHERE id = '1.1.1_UnconsciousSuccess';

UPDATE learning_contents
SET is_published = false, updated_at = NOW()
WHERE id IN (
  '1.1.2_EndWithFuture',
  '1.1.3_PrioritizingMostImportant',
  '1.1.4_WinWinThinking',
  '1.1.5_SeekFirstToUnderstand',
  '1.1.6_Synergize',
  '1.1.7_SharpenTheSaw'
);
