import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import supabase from '../../../utils/supabase';

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  email: 'メール / パスワード',
  apple: 'Apple',
  github: 'GitHub',
};

export const ProfileOAuthIdentities: React.FC = () => {
  const [identities, setIdentities] = useState<Array<{ provider: string; email?: string }>>([]);
  const [hasEmailIdentity, setHasEmailIdentity] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.identities) return;
      const mapped = user.identities.map((identity) => ({
        provider: identity.provider,
        email: typeof identity.identity_data?.email === 'string'
          ? identity.identity_data.email
          : undefined,
      }));
      setIdentities(mapped);
      setHasEmailIdentity(mapped.some((item) => item.provider === 'email'));
    })();
  }, []);

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <Typography variant="h3" color="brand" className="text-xl font-bold">
          ログイン方法
        </Typography>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {identities.length === 0 ? (
            <Typography variant="body-sm" color="muted">
              連携情報を読み込み中...
            </Typography>
          ) : (
            identities.map((identity) => (
              <li
                key={`${identity.provider}-${identity.email ?? 'default'}`}
                className="rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/40 px-4 py-3"
              >
                <Typography variant="body-sm" className="font-medium">
                  {PROVIDER_LABELS[identity.provider] ?? identity.provider}
                </Typography>
                {identity.email ? (
                  <Typography variant="caption" color="muted" className="mt-1 block">
                    {identity.email}
                  </Typography>
                ) : null}
              </li>
            ))
          )}
        </ul>
        {!hasEmailIdentity && identities.some((item) => item.provider === 'google') ? (
          <Typography variant="caption" color="muted" className="mt-4 block">
            Google ログインのみの場合は、パスワードを設定しておくとセキュリティが向上します。
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};
