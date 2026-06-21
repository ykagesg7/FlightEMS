import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyMfaForSensitiveAction } from '../../../auth/mfaAuth';
import { MfaCodeField } from '../../../components/auth/MfaCodeField';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import { useAuthStore } from '../../../stores/authStore';
import { toAppError } from '../../../types/error';
import supabase from '../../../utils/supabase';
import { useSensitiveMfaGate } from '../hooks/useSensitiveMfaGate';

const CONFIRM_PHRASE = 'アカウントを削除';

interface ProfileAccountDeleteSectionProps {
  userEmail: string | null | undefined;
  onError: (message: string) => void;
}

export const ProfileAccountDeleteSection: React.FC<ProfileAccountDeleteSectionProps> = ({
  userEmail,
  onError,
}) => {
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { loading: mfaGateLoading, mfaRequired, factorId } = useSensitiveMfaGate();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmPhrase !== CONFIRM_PHRASE) {
      onError(`確認のため「${CONFIRM_PHRASE}」と入力してください`);
      return;
    }
    if (mfaRequired && !factorId) {
      onError('二要素認証の確認に失敗しました。ページを再読み込みしてください');
      return;
    }
    if (mfaRequired && !mfaCode.trim()) {
      onError('認証アプリの 6 桁コードを入力してください');
      return;
    }

    setDeleting(true);
    try {
      if (mfaRequired && factorId) {
        const { error: mfaError } = await verifyMfaForSensitiveAction(factorId, mfaCode);
        if (mfaError) {
          onError(mfaError.message || '認証コードの確認に失敗しました');
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        onError('セッションが無効です。再ログインしてください');
        return;
      }

      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmPhrase,
          password: password || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        onError(payload.error || 'アカウント削除に失敗しました');
        return;
      }

      await signOut();
      navigate('/');
    } catch (err) {
      onError(toAppError(err).message || 'アカウント削除中にエラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card variant="brand" padding="lg" className="border-red-500/40">
      <CardHeader>
        <Typography variant="h3" className="text-xl font-bold text-red-400">
          アカウント削除
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography variant="body-sm" color="muted" className="mb-4">
          学習記録・プロフィール・cohort データなどは復元できません。削除前に内容を確認してください。
        </Typography>
        <form onSubmit={(e) => void handleDelete(e)} className="space-y-4">
          <div>
            <label htmlFor="delete-confirm" className="mb-2 block text-sm font-medium">
              確認のため「{CONFIRM_PHRASE}」と入力
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              className="w-full rounded-lg border-2 border-red-500/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
            />
          </div>
          {userEmail ? (
            <div>
              <label htmlFor="delete-password" className="mb-2 block text-sm font-medium">
                パスワード（メールログインの場合）
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-red-500/30 bg-brand-secondary-dark px-4 py-3 text-[var(--text-primary)]"
                autoComplete="current-password"
              />
            </div>
          ) : null}
          {mfaGateLoading ? (
            <Typography variant="caption" color="muted">二要素認証の確認...</Typography>
          ) : mfaRequired ? (
            <MfaCodeField
              id="delete-mfa-code"
              value={mfaCode}
              onChange={setMfaCode}
              disabled={deleting}
              variant="danger"
              helperText="アカウント削除には、二要素認証の確認が必要です。"
            />
          ) : null}
          <Button type="submit" variant="ghost" disabled={deleting} className="!text-red-400 hover:!bg-red-500/10">
            {deleting ? '削除中...' : 'アカウントを完全に削除'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
