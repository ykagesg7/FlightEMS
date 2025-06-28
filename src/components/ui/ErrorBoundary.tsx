import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーバウンダリーがエラーをキャッチしました:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // フォールバックUIを表示
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 text-gray-800">
          <h2 className="text-2xl font-bold mb-4">問題が発生しました</h2>
          <p className="mb-4">アプリケーションで問題が発生しました。ページをリロードして再試行してください。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            ページをリロード
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 