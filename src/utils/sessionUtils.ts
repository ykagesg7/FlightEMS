/**
 * 匿名ユーザーのセッション管理ユーティリティ
 */

// セッションIDのキー
const SESSION_ID_KEY = 'flight_academy_session_id';

/**
 * セッションIDを生成
 */
export function generateSessionId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * セッションIDを取得（存在しない場合は新規作成）
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * セッションIDをリセット
 */
export function resetSessionId(): string {
  const newSessionId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}

/**
 * ユーザーエージェント情報を取得
 */
export function getUserAgent(): string {
  return navigator.userAgent;
}

/**
 * 匿名ユーザーの識別情報を取得
 */
export function getAnonymousUserInfo() {
  return {
    sessionId: getSessionId(),
    userAgent: getUserAgent(),
    timestamp: new Date().toISOString()
  };
}

/**
 * ローカルストレージからいいね状態を取得
 */
export function getLocalLikeState(contentId: string): boolean {
  const key = `like_${contentId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * ローカルストレージにいいね状態を保存
 */
export function setLocalLikeState(contentId: string, liked: boolean): void {
  const key = `like_${contentId}`;
  if (liked) {
    localStorage.setItem(key, 'true');
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * ローカルストレージから閲覧済み状態を取得
 */
export function getLocalViewState(contentId: string): boolean {
  const key = `viewed_${contentId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * ローカルストレージに閲覧済み状態を保存
 */
export function setLocalViewState(contentId: string): void {
  const key = `viewed_${contentId}`;
  localStorage.setItem(key, 'true');
} 