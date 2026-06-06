import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => (
  <div className="min-h-screen bg-[var(--bg)] py-16 flex justify-center items-center p-4">
    <Card variant="brand" padding="lg" className="max-w-md w-full border-brand-primary/30">
      <CardHeader>
        <CardTitle>
          <span className="font-display text-2xl md:text-3xl font-bold tracking-tight text-brand-primary">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
);
