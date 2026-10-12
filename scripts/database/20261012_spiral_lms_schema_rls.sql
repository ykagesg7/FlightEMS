-- Spiral matrix LMS (MVP PR ①): catalog + learner progress tables and RLS.
-- Apply via Supabase migration pipeline only after 上様 approval (not in this PR deploy).
-- CREATE TABLE IF NOT EXISTS does not add new columns to an already-applied table;
-- use follow-up migrations for column changes on existing environments.

BEGIN;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nodes (
  id text PRIMARY KEY,
  title text NOT NULL,
  quadrant smallint NOT NULL CHECK (quadrant BETWEEN 1 AND 4),
  z_level smallint NOT NULL CHECK (z_level BETWEEN 1 AND 4),
  sort_order integer NOT NULL,
  passing_score numeric,
  unlock_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_published boolean NOT NULL DEFAULT false,
  opens_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.nodes
  ADD COLUMN IF NOT EXISTS opens_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_nodes_z_quadrant_sort
  ON public.nodes (z_level, quadrant, sort_order);

CREATE INDEX IF NOT EXISTS idx_nodes_published
  ON public.nodes (is_published)
  WHERE is_published = true;

CREATE TABLE IF NOT EXISTS public.node_prerequisites (
  node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  prerequisite_node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  PRIMARY KEY (node_id, prerequisite_node_id),
  CONSTRAINT node_prerequisites_no_self_ref CHECK (node_id <> prerequisite_node_id)
);

CREATE INDEX IF NOT EXISTS idx_node_prerequisites_prerequisite
  ON public.node_prerequisites (prerequisite_node_id);

CREATE TABLE IF NOT EXISTS public.node_contents (
  node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  content_slug text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('article', 'lesson')),
  is_required boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (node_id, content_slug)
);

CREATE INDEX IF NOT EXISTS idx_node_contents_slug
  ON public.node_contents (content_slug);

-- ---------------------------------------------------------------------------
-- Learner state (writes only via SECURITY DEFINER record_attempt in PR ②)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'LOCKED' CHECK (
    status IN (
      'LOCKED',
      'AVAILABLE',
      'IN_PROGRESS',
      'MASTERED',
      'MAINTENANCE'
    )
  ),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_attempt_at timestamptz,
  mastered_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, node_id)
);

ALTER TABLE public.user_progress
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_user_progress_user
  ON public.user_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_node
  ON public.user_progress (node_id);

CREATE TABLE IF NOT EXISTS public.user_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  node_id text NOT NULL REFERENCES public.nodes (id) ON DELETE CASCADE,
  score numeric,
  passed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_attempts_user_node_created
  ON public.user_attempts (user_id, node_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.spiral_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.spiral_set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.spiral_set_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.spiral_set_updated_at() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.spiral_set_updated_at() TO postgres;

DROP TRIGGER IF EXISTS trg_spiral_nodes_updated_at ON public.nodes;
CREATE TRIGGER trg_spiral_nodes_updated_at
  BEFORE UPDATE ON public.nodes
  FOR EACH ROW
  EXECUTE FUNCTION public.spiral_set_updated_at();

DROP TRIGGER IF EXISTS trg_spiral_user_progress_updated_at ON public.user_progress;
CREATE TRIGGER trg_spiral_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.spiral_set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.node_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_attempts ENABLE ROW LEVEL SECURITY;

-- Catalog: published nodes readable by anon + authenticated; no client writes.
DROP POLICY IF EXISTS nodes_select_published ON public.nodes;
CREATE POLICY nodes_select_published ON public.nodes
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS node_prerequisites_select_published ON public.node_prerequisites;
CREATE POLICY node_prerequisites_select_published ON public.node_prerequisites
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.id = node_prerequisites.node_id
        AND n.is_published = true
    )
    AND EXISTS (
      SELECT 1
      FROM public.nodes p
      WHERE p.id = node_prerequisites.prerequisite_node_id
        AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS node_contents_select_published ON public.node_contents;
CREATE POLICY node_contents_select_published ON public.node_contents
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.nodes n
      WHERE n.id = node_contents.node_id
        AND n.is_published = true
    )
  );

-- Progress: authenticated users read own rows only; no client DML.
DROP POLICY IF EXISTS user_progress_select_own ON public.user_progress;
CREATE POLICY user_progress_select_own ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS user_attempts_select_own ON public.user_attempts;
CREATE POLICY user_attempts_select_own ON public.user_attempts
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON TABLE public.nodes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.node_prerequisites FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.node_contents FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.user_progress FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.user_attempts FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.nodes TO anon, authenticated;
GRANT SELECT ON TABLE public.node_prerequisites TO anon, authenticated;
GRANT SELECT ON TABLE public.node_contents TO anon, authenticated;
GRANT SELECT ON TABLE public.user_progress TO authenticated;
GRANT SELECT ON TABLE public.user_attempts TO authenticated;

COMMENT ON TABLE public.nodes IS
  'Spiral LMS learning units (quadrant × z_level). Coordinates derived at render time.';
COMMENT ON COLUMN public.nodes.opens_at IS
  'Optional future publish time for 公開予定 UI; NULL means no scheduled gate.';
COMMENT ON TABLE public.node_contents IS
  'MDX content slugs attached to a node; is_required drives completion before mini-quiz.';
COMMENT ON TABLE public.user_progress IS
  'Per-user node status. Mutations only via record_attempt (SECURITY DEFINER), PR ②.';
COMMENT ON TABLE public.user_attempts IS
  'Immutable attempt history. Inserts only via record_attempt (SECURITY DEFINER), PR ②.';

COMMIT;
