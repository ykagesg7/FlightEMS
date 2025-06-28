import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import RequireAuth from './RequireAuth';

interface SafeRequireAuthProps {
  children: ReactNode;
}

export const SafeRequireAuth: React.FC<SafeRequireAuthProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<Navigate to="/auth" />}>
      <RequireAuth>
        {children}
      </RequireAuth>
    </ErrorBoundary>
  );
}; 