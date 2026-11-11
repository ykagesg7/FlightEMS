/**
 * SWIM ログインセッション（Cookie）のプロセス内再利用。
 * Vercel サーバレスはインスタンスごとにメモリが分かれる。
 */

const SESSION_TTL_MS = 8 * 60 * 1000;

type SessionEntry = {
  cookie: string;
  expiresAtMs: number;
};

let session: SessionEntry | null = null;

export function readSwimLoginSession(nowMs = Date.now()): string | null {
  if (!session) return null;
  if (session.expiresAtMs <= nowMs) {
    session = null;
    return null;
  }
  return session.cookie;
}

export function writeSwimLoginSession(cookie: string, nowMs = Date.now()): void {
  session = { cookie, expiresAtMs: nowMs + SESSION_TTL_MS };
}

export function invalidateSwimLoginSession(): void {
  session = null;
}

export function __resetSwimLoginSessionForTests(): void {
  session = null;
}
