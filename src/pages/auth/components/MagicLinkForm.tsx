import React, { useCallback, useState } from 'react';
import { Button } from '../../../components/ui';
import { mapAuthErrorToMessage } from '../../../auth/authErrorMessages';
import { TurnstileWidget } from '../../../components/auth/TurnstileWidget';
import { useAuthStore } from '../../../stores/authStore';
import { AuthInput } from './AuthInput';

interface MagicLinkFormProps {
  onSent: (email: string) => void;
  onError?: (message: string) => void;
  onCancel?: () => void;
}

export const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onSent, onError, onCancel }) => {
  const loading = useAuthStore((state) => state.loading);
  const signInWithOtp = useAuthStore((state) => state.signInWithOtp);
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      onError?.('メールアドレスを入力してください');
      return;
    }

    const { error } = await signInWithOtp(email.trim(), captchaToken ?? undefined);
    if (error) {
      onError?.(mapAuthErrorToMessage(error, 'ログインリンクの送信に失敗しました。'));
      return;
    }
    onSent(email.trim());
  }, [captchaToken, email, onError, onSent, signInWithOtp]);

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <AuthInput
        label="メールアドレス"
        type="email"
        id="magic-link-email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <TurnstileWidget
        className="mb-4 flex justify-center"
        onVerify={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
      />

      <Button type="submit" variant="brand" size="md" disabled={loading} className="w-full">
        {loading ? '送信中...' : 'ログインリンクを送信'}
      </Button>

      <p className="mt-3 text-xs text-center text-[var(--text-muted)]">
        メールに届くリンクからパスワードなしでログインできます。
      </p>

      {onCancel && (
        <p className="mt-3 text-sm text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-brand-primary hover:text-brand-primary-light hover:underline focus:outline-none"
          >
            パスワードでログインに戻る
          </button>
        </p>
      )}
    </form>
  );
};
