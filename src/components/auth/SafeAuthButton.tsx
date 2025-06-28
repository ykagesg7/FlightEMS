import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import NewAuthButton from './NewAuthButton';

export const SafeAuthButton: React.FC = () => {
  return (
    <ErrorBoundary fallback={
      <Link to="/auth" className="px-4 py-2 rounded-md bg-indigo-500 text-white">
        ログイン
      </Link>
    }>
      <NewAuthButton />
    </ErrorBoundary>
  );
}; 