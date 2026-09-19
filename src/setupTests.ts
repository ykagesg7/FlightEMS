import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Node 24 undici `Request` rejects jsdom's AbortSignal (different realm).
 * React Router's data router builds `new Request(url, { signal })` during
 * `startNavigation`; that TypeError aborts the transition and leaves the
 * previous page mounted. Drop an incompatible signal so tests still navigate.
 */
function installJsdomAbortSignalRequestCompat(): void {
  const OriginalRequest = globalThis.Request;
  if (typeof OriginalRequest !== 'function') {
    return;
  }

  try {
    void new OriginalRequest('http://127.0.0.1/', {
      signal: new AbortController().signal,
    });
    return;
  } catch (error) {
    if (!(error instanceof TypeError) || !error.message.includes('AbortSignal')) {
      throw error;
    }
  }

  const CompatibleRequest = function Request(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): globalThis.Request {
    try {
      return new OriginalRequest(input, init);
    } catch (error) {
      if (
        init?.signal &&
        error instanceof TypeError &&
        error.message.includes('AbortSignal')
      ) {
        const { signal: _ignored, ...rest } = init;
        return new OriginalRequest(input, rest);
      }
      throw error;
    }
  };
  CompatibleRequest.prototype = OriginalRequest.prototype;
  Object.setPrototypeOf(CompatibleRequest, OriginalRequest);
  Object.defineProperty(globalThis, 'Request', {
    configurable: true,
    writable: true,
    value: CompatibleRequest,
  });
}

installJsdomAbortSignalRequestCompat();

// 環境変数のモック設定（テスト環境用）
Object.defineProperty(import.meta, 'env', {
  value: {
    ...import.meta.env,
    MODE: 'test',
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
  writable: true,
});

// Supabaseのモック設定
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Sentryのモック設定（テスト時にSentryが干渉しないようにする）
vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((cb: (scope: unknown) => void) => cb({
    setContext: vi.fn(),
    setExtra: vi.fn(),
    setTag: vi.fn(),
  })),
  browserTracingIntegration: vi.fn(),
  replayIntegration: vi.fn(),
  feedbackIntegration: vi.fn(),
  ErrorBoundary: vi.fn(({ children }: { children: unknown }) => children),
}));

// Leafletのモック設定
vi.mock('leaflet', () => ({
  map: vi.fn(),
  tileLayer: vi.fn(),
  marker: vi.fn(),
  icon: vi.fn(),
}));
