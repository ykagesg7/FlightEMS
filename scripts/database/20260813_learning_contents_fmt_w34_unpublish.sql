-- FMT W34 drip: unpublish 1-1..1-3 until articlePublishSchedule dates
-- (Mon 8/17, Wed 8/19, Fri 8/21). Cron article-publish-sync flips is_published.

UPDATE learning_contents
SET is_published = false, updated_at = NOW()
WHERE id IN (
  'FMT-1-1_WingmanVFR',
  'FMT-1-2_RunwayLineupTakeoff',
  'FMT-1-3_FingertipRoute'
);
