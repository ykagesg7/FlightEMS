-- Spiral matrix LMS: supporting indexes for FK columns (slug map + attempts).
-- Apply via Supabase migration pipeline only after 上様 approval.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_spiral_content_slug_map_learning_content_id
  ON public.spiral_content_slug_map (learning_content_id);

CREATE INDEX IF NOT EXISTS idx_user_attempts_node_id
  ON public.user_attempts (node_id);

COMMENT ON INDEX public.idx_spiral_content_slug_map_learning_content_id IS
  'Reverse lookup: learning_contents.id -> spiral_content_slug_map rows.';
COMMENT ON INDEX public.idx_user_attempts_node_id IS
  'FK support for user_attempts.node_id -> nodes.id.';

COMMIT;
