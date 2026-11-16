export type AuthFieldFocusStep = { id: string; key: string };

export const AUTH_LOGIN_FIELD_ORDER: AuthFieldFocusStep[] = [
  { id: 'email', key: 'email' },
  { id: 'current-password', key: 'password' },
];

export const AUTH_SIGNUP_FIELD_ORDER: AuthFieldFocusStep[] = [
  { id: 'email', key: 'email' },
  { id: 'username', key: 'username' },
  { id: 'new-password', key: 'password' },
  { id: 'confirm-password', key: 'confirm-password' },
];

export const AUTH_RESET_EMAIL_FIELD_ORDER: AuthFieldFocusStep[] = [
  { id: 'reset-email', key: 'email' },
];

export const RECOVERY_FIELD_ORDER: AuthFieldFocusStep[] = [
  { id: 'new-password', key: 'password' },
  { id: 'confirm-password', key: 'confirm-password' },
];

export function firstInvalidFieldId(
  order: readonly AuthFieldFocusStep[],
  fieldErrors: Record<string, string | undefined>,
): string | null {
  for (const { id, key } of order) {
    if (fieldErrors[key]) {
      return id;
    }
  }
  return null;
}

export function focusFieldById(fieldId: string): void {
  const el = document.getElementById(fieldId);
  if (el instanceof HTMLInputElement) {
    el.focus();
  }
}