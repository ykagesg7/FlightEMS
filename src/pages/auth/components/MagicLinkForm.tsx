import React, { useCallback, useState } from 'react';
import { Button } from '../../../components/ui';
import { mapAuthErrorToMessage } from '../../../auth/authErrorMessages';
import { TurnstileWidget } from '../../../components/auth/TurnstileWidget';
import { useAuthStore } from '../../../stores/authStore';

interface MagicLinkFormProps {
  onSent: (email: string) => void;
  onError?: (message: string) => void;
}

export const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ onSent, onError }) => {
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
      <div className="mb-4">
        <label htmlFor="magic-link-email" className="block mb-2 text-sm font-medium text-white">
          メールアドレス
        </label>
        <input
          type="email"
          id="magic-link-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 text-white focus:outline-none focus:ring-2 focus:ring-whiskyPapa-yellow/50 focus:border-whiskyPapa-yellow transition-colors"
          autoComplete="email"
        />
      </div>

      <TurnstileWidget
        className="mb-4 flex justify-center"
        onVerify={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
      />

      <Button type="submit" variant="brand" size="md" disabled={loading} className="w-full">
        {loading ? '送信中...' : 'ログインリンクを送信'}
      </Button>

      <p className="mt-3 text-xs text-center text-gray-400">
        メールに届くリンクからパスワードなしでログインできます。
      </p>
    </form>
  );
};
