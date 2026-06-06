import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';

interface ProfileAccountSectionProps {
  email: string | null | undefined;
}

export const ProfileAccountSection: React.FC<ProfileAccountSectionProps> = ({ email }) => (
  <Card variant="brand" padding="lg">
    <CardHeader>
      <Typography variant="h3" color="brand" className="text-xl font-bold">
        アカウント
      </Typography>
    </CardHeader>
    <CardContent>
      <ProfileField label="メールアドレス" value={email || '—'} />
      <Typography variant="caption" color="muted" className="mt-4 block">
        メールアドレスの変更は Supabase Auth の設定に依存します。現時点では表示のみです。
      </Typography>
    </CardContent>
  </Card>
);

interface ProfileFieldProps {
  label: string;
  value: string;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => (
  <div>
    <Typography variant="body-sm" className="mb-2 font-medium">
      {label}
    </Typography>
    <Typography variant="body" color="muted">
      {value}
    </Typography>
  </div>
);
