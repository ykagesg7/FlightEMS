-- Rename Contact stems CTX-* → CP-*. Copy rows, retarget FKs, then drop old ids.
-- Do not flip is_published.

INSERT INTO learning_contents (
  id, title, category, sub_category, description, order_index, parent_id, content_type, is_published, updated_at
)
SELECT
  replace(id, 'CTX-', 'CP-'),
  title,
  category,
  sub_category,
  description,
  order_index,
  parent_id,
  content_type,
  is_published,
  NOW()
FROM learning_contents
WHERE id IN (
  'CTX-1-1_AreaAndPurpose',
  'CTX-1-2_Energy',
  'CTX-1-3_ControlsGPio'
);

UPDATE learning_progress
SET content_id = replace(content_id, 'CTX-', 'CP-')
WHERE content_id LIKE 'CTX-%';

UPDATE learning_content_views
SET content_id = replace(content_id, 'CTX-', 'CP-')
WHERE content_id LIKE 'CTX-%';

UPDATE learning_content_likes
SET content_id = replace(content_id, 'CTX-', 'CP-')
WHERE content_id LIKE 'CTX-%';

UPDATE learning_content_comments
SET content_id = replace(content_id, 'CTX-', 'CP-')
WHERE content_id LIKE 'CTX-%';

DELETE FROM learning_contents
WHERE id IN (
  'CTX-1-1_AreaAndPurpose',
  'CTX-1-2_Energy',
  'CTX-1-3_ControlsGPio'
);
