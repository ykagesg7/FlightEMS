-- MFA recovery codes (hashed, one-time). Plain codes are shown once via API only.

CREATE TABLE IF NOT EXISTS public.mfa_recovery_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mfa_recovery_codes_user_unused_idx
  ON public.mfa_recovery_codes (user_id)
  WHERE used_at IS NULL;

ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.mfa_recovery_codes IS
  'Hashed MFA recovery codes (one-time). Access via service role API only.';

REVOKE ALL ON public.mfa_recovery_codes FROM anon, authenticated;
GRANT ALL ON public.mfa_recovery_codes TO service_role;
