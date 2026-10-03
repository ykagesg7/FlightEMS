import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { isChunkLoadFailure, reloadOnceForStaleChunk } from '../utils/chunkLoadRecovery';

function routeErrorAsUnknown(error: unknown): unknown {
  if (isRouteErrorResponse(error)) {
    return new Error(error.statusText || `HTTP ${error.status}`);
  }
  return error;
}

export function RouteErrorElement() {
  const routeError = useRouteError();
  const error = routeErrorAsUnknown(routeError);
  const chunkError = isChunkLoadFailure(error);

  useEffect(() => {
    if (chunkError) {
      reloadOnceForStaleChunk();
    }
  }, [chunkError]);

  if (chunkError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <p className="text-gray-700 dark:text-gray-200 text-center">アプリの更新を読み込んでいます…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">ページを表示できませんでした</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
          一時的な問題の可能性があります。再読み込みをお試しください。
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          再読み込み
        </button>
      </div>
    </div>
  );
}
