import { describe, expect, it } from 'vitest';
import {
  AUTH_LOGIN_FIELD_ORDER,
  firstInvalidFieldId,
} from '@/pages/auth/authFieldValidation';

describe('authFieldValidation', () => {
  it('returns the first invalid field id in tab order', () => {
    expect(
      firstInvalidFieldId(AUTH_LOGIN_FIELD_ORDER, {
        email: 'メールアドレスを入力してください',
        password: 'パスワードを入力してください',
      }),
    ).toBe('email');

    expect(
      firstInvalidFieldId(AUTH_LOGIN_FIELD_ORDER, {
        password: 'パスワードを入力してください',
      }),
    ).toBe('current-password');
  });
});