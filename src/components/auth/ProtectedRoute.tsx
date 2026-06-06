import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

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

  if (!initialized || loading || (requireAdmin && user && !profile)) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskyPapa-yellow mx-auto mb-4" />
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (requireAdmin && profile?.roll?.toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
