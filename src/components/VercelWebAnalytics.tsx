import { Analytics } from '@vercel/analytics/react';
import { useLocation, useParams } from 'react-router-dom';

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function turnValueToRegExp(value: string): RegExp {
  return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}

/** Remix 実装と同様に、動的セグメントを `[param]` 形式に正規化する。 */
function computeRoute(pathname: string, pathParams: Record<string, string | undefined>): string {
  let result = pathname;
  try {
    const entries = Object.entries(pathParams);
    for (const [key, value] of entries) {
      if (value !== undefined && value !== '') {
        const matcher = turnValueToRegExp(value);
        if (matcher.test(result)) {
          result = result.replace(matcher, `/[${key}]`);
        }
      }
    }
    return result;
  } catch {
    return pathname;
  }
}

/**
 * RouterProvider 配下でマウントすること。
 * `route` / `path` を渡して SPA のクライアント遷移ごとに pageview を送る（@vercel/analytics/react の公式パターン）。
 */
export function VercelWebAnalytics() {
  const { pathname, search } = useLocation();
  const params = useParams();
  const path = `${pathname}${search}`;
  const route = computeRoute(pathname, params);

  return <Analytics route={route} path={path} />;
}
