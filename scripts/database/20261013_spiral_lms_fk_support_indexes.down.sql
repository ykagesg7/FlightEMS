-- Rollback: 20261013_spiral_lms_fk_support_indexes.sql

BEGIN;

DROP INDEX IF EXISTS public.idx_user_attempts_node_id;
DROP INDEX IF EXISTS public.idx_spiral_content_slug_map_learning_content_id;

COMMIT;
