/**
 * 一時的な Sentry 動作確認用（本番で Issues にイベントが出るか検証）。
 * 確認後はルートと本ファイルを削除すること（docs/04 参照）。
 */
import * as Sentry from '@sentry/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Typography } from '../../components/ui';

const SentryTestPage: React.FC = () => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const isProd = import.meta.env.PROD;
  const canTest = isProd && !!dsn;

  const sendCaptured = () => {
    const err = new Error('Manual Sentry verification (captureException /debug/sentry-test)');
    Sentry.captureException(err);
    setLastAction('captureException を送信しました。数十秒後に Sentry の Issues を確認してください。');
  };

  const throwUncaught = () => {
    setLastAction('未処理例外を投げます…');
    setTimeout(() => {
      throw new Error('Manual Sentry verification (uncaught throw /debug/sentry-test)');
    }, 0);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Typography variant="h2" className="text-xl font-semibold">
            Sentry 検証（一時）
          </Typography>
          <p className="text-sm text-muted-foreground">
            URL は公開されていますがリンクは置いていません。検証後は{' '}
            <code className="rounded bg-muted px-1">App.tsx</code> のルートと本ページを削除してください。
          </p>

          {!isProd && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
              開発モードでは Sentry 送信は無効です。本番デプロイ URL で開いてください。
            </p>
          )}

          {isProd && !dsn && (
            <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm">
              <code className="rounded bg-muted px-1">VITE_SENTRY_DSN</code> がビルドに含まれていません。Vercel
              の Environment Variables と Redeploy を確認してください。
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" disabled={!canTest} onClick={sendCaptured} variant="primary">
              captureException で送る
            </Button>
            <Button type="button" disabled={!canTest} onClick={throwUncaught} variant="secondary">
              未処理例外を投げる
            </Button>
          </div>

          {lastAction && <p className="text-sm text-muted-foreground">{lastAction}</p>}

          <Link to="/" className="inline-block text-sm text-primary underline">
            ホームへ戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentryTestPage;
