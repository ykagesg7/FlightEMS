-- User-defined waypoints for Planning (per-user saved coordinate points).
-- Apply in Supabase SQL editor or migration pipeline BEFORE/at deploy that uses the UI.

CREATE TABLE IF NOT EXISTS public.user_saved_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) > 0),
  ident text,
  memo text,
  latitude double precision NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude double precision NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_saved_waypoints_user_id_idx
  ON public.user_saved_waypoints (user_id);

CREATE INDEX IF NOT EXISTS user_saved_waypoints_user_updated_idx
  ON public.user_saved_waypoints (user_id, updated_at DESC);

ALTER TABLE public.user_saved_waypoints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_saved_waypoints_select_own ON public.user_saved_waypoints;
CREATE POLICY user_saved_waypoints_select_own
  ON public.user_saved_waypoints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_saved_waypoints_insert_own ON public.user_saved_waypoints;
CREATE POLICY user_saved_waypoints_insert_own
  ON public.user_saved_waypoints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_saved_waypoints_update_own ON public.user_saved_waypoints;
CREATE POLICY user_saved_waypoints_update_own
  ON public.user_saved_waypoints
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_saved_waypoints_delete_own ON public.user_saved_waypoints;
CREATE POLICY user_saved_waypoints_delete_own
  ON public.user_saved_waypoints
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.user_saved_waypoints IS
  'Per-user saved planning waypoints (coordinate mode / my points). RLS: own rows only.';
