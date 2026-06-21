import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { shouldPromptLoginMfa } from '../../auth/mfaAuth';
import { useAuthStore } from '../../stores/authStore';
import { isAdminUser } from '../../utils/isAdminUser';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/auth',
}) => {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const location = useLocation();
  const [loginMfaGate, setLoginMfaGate] = useState<'pending' | 'ok' | 'required'>('pending');

  useEffect(() => {
    if (!requireAuth || !user || !profile || !initialized || loading) {
      setLoginMfaGate('ok');
      return;
    }

    let cancelled = false;
    void shouldPromptLoginMfa(profile).then(({ required }) => {
      if (cancelled) return;
      setLoginMfaGate(required ? 'required' : 'ok');
    });

    return () => {
      cancelled = true;
    };
  }, [requireAuth, user, profile, initialized, loading]);

  if (!initialized || loading || (requireAdmin && user && !profile)) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (requireAuth && user && profile && loginMfaGate === 'pending') {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">認証を確認中...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && user && profile && loginMfaGate === 'required') {
    return (
      <Navigate
        to="/auth?mfa=required"
        replace
        state={{ from: location }}
      />
    );
  }

  if (requireAdmin && !isAdminUser(profile)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
