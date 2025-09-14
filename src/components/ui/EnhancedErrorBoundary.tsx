import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
}

class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // エラー情報をログに記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 外部エラーハンドラーを呼び出し
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Supabaseにエラーレポートを送信（本番環境のみ）
    if (import.meta.env.PROD) {
      this.reportError(error, errorInfo);
    }
  }

  private async reportError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      // エラー情報をSupabaseに送信（実装時にSupabaseクライアントを使用）
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      console.log('Error reported:', errorData);
      // 実際の実装時: await supabase.from('error_logs').insert(errorData);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state;

    // 最大3回まで自動再試行
    if (retryCount < 3) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックが提供されている場合は使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                予期しないエラーが発生しました
              </h1>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                申し訳ございません。システムで問題が発生しました。
                以下の方法で問題を解決できる可能性があります。
              </p>

              <div className="space-y-3 mb-6">
                {retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    再試行 ({3 - retryCount}回まで)
                  </button>
                )}

                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  ページを再読み込み
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Home className="h-5 w-5 mr-2" />
                  ホームページに戻る
                </button>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                問題が続く場合は、ブラウザのキャッシュをクリアするか、
                しばらく時間をおいてから再度お試しください。
              </div>

              {this.props.showErrorDetails && error && (
                <details className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    技術的詳細を表示
                  </summary>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                    <div>
                      <strong>エラーメッセージ:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong>スタックトレース:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Flight Academy TSX - 航空機操縦士学習プラットフォーム
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
