-- Login-time MFA is opt-in: default OFF. Users enable in Profile when 2FA is enrolled.
-- Existing rows reset to false (previous default was true for all profiles).

ALTER TABLE profiles
  ALTER COLUMN mfa_required_at_login SET DEFAULT false;

UPDATE profiles
SET mfa_required_at_login = false
WHERE mfa_required_at_login = true;

COMMENT ON COLUMN profiles.mfa_required_at_login IS
  'When true, verified TOTP factors require a code at each login. Default false (opt-in). Sensitive profile actions always require MFA when factors exist.';
