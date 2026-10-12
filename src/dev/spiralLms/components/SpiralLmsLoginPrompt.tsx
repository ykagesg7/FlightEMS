import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';

type SpiralLmsLoginPromptProps = {
  returnPath: string;
};

export const SpiralLmsLoginPrompt: React.FC<SpiralLmsLoginPromptProps> = ({ returnPath }) => {
  return (
    <Card variant="default" className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">ログインして進捗を表示</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[color:var(--text-secondary)]">
          螺旋マトリックスの進捗と「今日の1単元」は、ログイン後に表示されます。
        </p>
        <Link to="/auth" state={{ from: { pathname: returnPath } }} className="inline-block">
          <Button type="button" variant="primary" size="md">
            ログイン / 新規登録
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
