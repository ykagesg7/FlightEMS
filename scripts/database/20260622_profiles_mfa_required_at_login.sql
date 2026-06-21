-- profiles: optional login-time MFA requirement (default ON when 2FA is enrolled)
-- When false, user skips TOTP at login but sensitive actions still require MFA if factors exist.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mfa_required_at_login boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.mfa_required_at_login IS
  'When true (default), verified TOTP factors require a code at each login. Sensitive profile actions always require MFA when factors exist.';
