import type { AuthError } from '@supabase/supabase-js';
import type { AuthErrorResult } from '../stores/authStore';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'メールアドレスまたはパスワードが正しくありません。',
  email_not_confirmed: 'メールアドレスの確認が完了していません。受信トレイをご確認ください。',
  over_email_send_rate_limit: 'メール送信の上限に達しました。しばらくしてから再度お試しください。',
  user_already_registered: 'このメールアドレスは既に登録されています。',
  signup_disabled: '新規登録は現在受け付けていません。',
  otp_expired: 'リンクの有効期限が切れています。再度ログインリンクを送信してください。',
  validation_failed: '入力内容を確認してください。',
};

export function mapAuthErrorToMessage(error: AuthErrorResult, fallback: string): string {
  if (!error) return fallback;

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as AuthError).code ?? '')
      : '';

  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  const message = error.message?.trim();
  if (message) return message;
  return fallback;
}
