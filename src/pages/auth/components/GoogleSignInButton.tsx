import React, { useCallback } from 'react';
import { mapAuthErrorToMessage } from '../../../auth/authErrorMessages';
import { useAuthStore } from '../../../stores/authStore';
import { GoogleIcon } from './GoogleIcon';

interface GoogleSignInButtonProps {
  onError?: (message: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onError }) => {
  const loading = useAuthStore((state) => state.loading);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

  const handleClick = useCallback(async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      onError?.(mapAuthErrorToMessage(error, 'Googleログインに失敗しました。'));
    }
  }, [onError, signInWithGoogle]);

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        aria-label="Google で続ける"
        aria-busy={loading}
        onClick={() => void handleClick()}
        className="flex w-full min-h-[44px] items-center justify-center gap-3 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? 'リダイレクト中...' : 'Google で続ける'}
      </button>
      <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
        メールアドレスと名前のみ取得します
      </p>
    </div>
  );
};
