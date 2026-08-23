export type LastAuthMethod = 'password' | 'google' | 'magic-link';

const STORAGE_KEY = 'flightacademy.auth.last-method';

const LABELS: Record<LastAuthMethod, string> = {
  password: 'メールアドレスとパスワード',
  google: 'Google',
  'magic-link': 'メールのログインリンク',
};

function isLastAuthMethod(value: string | null): value is LastAuthMethod {
  return value === 'password' || value === 'google' || value === 'magic-link';
}

/** 前回成功したログイン方法を覚えておく（方法を忘れて不要なパスワードリセットに走るのを防ぐ） */
export function rememberLastAuthMethod(method: LastAuthMethod): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, method);
  } catch {
    // localStorage unavailable
  }
}

export function getLastAuthMethod(): LastAuthMethod | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return isLastAuthMethod(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function describeLastAuthMethod(method: LastAuthMethod): string {
  return LABELS[method];
}
