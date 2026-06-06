import React, { useCallback } from 'react';
import { Button } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { mapAuthErrorToMessage } from '../../../auth/authErrorMessages';

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
    <Button
      type="button"
      variant="brand"
      size="md"
      disabled={loading}
      onClick={() => void handleClick()}
      className="w-full border border-whiskyPapa-yellow/40 bg-whiskyPapa-black-dark hover:bg-whiskyPapa-black-dark/80"
    >
      {loading ? 'リダイレクト中...' : 'Google で続ける'}
    </Button>
  );
};
