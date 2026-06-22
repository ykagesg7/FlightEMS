-- Explicit deny RLS policies for mfa_recovery_codes (Security Advisor INFO fix).
-- Table remains service_role-only via REVOKE; these policies document intent for anon/authenticated.

CREATE POLICY mfa_recovery_codes_deny_anon
  ON public.mfa_recovery_codes
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY mfa_recovery_codes_deny_authenticated
  ON public.mfa_recovery_codes
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);
