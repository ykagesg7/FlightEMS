import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '../../../components/ui';
import { GUEST_CTA_PRIMARY_CLASS } from '../../../constants/guestSurfaceCta';

export const HomeFirstStepCta: React.FC = () => {
  return (
    <Card
      variant="hud"
      padding="md"
      className="mb-6 border-brand-primary/60 bg-brand-primary/5"
      data-testid="home-first-step-cta"
    >
      <CardContent>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <Typography variant="caption" color="muted" className="mb-1">
              はじめての学習
            </Typography>
            <Typography variant="h3" color="brand" className="mb-2">
              まずは短いクイズから
            </Typography>
            <Typography variant="body-sm" color="muted">
              学科試験の問題形式に慣れるため、最初の5問から始めましょう。結果はホームに反映されます。
            </Typography>
          </div>
          <Link to="/quiz" className={`${GUEST_CTA_PRIMARY_CLASS} shrink-0 px-6 py-3 sm:px-8 sm:py-4`}>
            最初の5問を解く
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
