const DEV_ANNOUNCEMENT_PATTERNS: RegExp[] = [
  /^Phase\s*\d/i,
  /\bHomePage\b/i,
  /改修/,
  /アンロック/,
  /デプロイ/,
  /開発フェーズ/,
  /^\[dev\]/i,
];

export function isDevAnnouncement(title: string): boolean {
  return DEV_ANNOUNCEMENT_PATTERNS.some((pattern) => pattern.test(title));
}

/**
 * ゲスト向けホームの「最新情報」用。開発フェーズ・内部改修ログ風のタイトルを除外する。
 * REST では最大5件取得するが、表示件数はここでさらに減る（日付パースやカルーセルでは絞らない）。
 */
export function filterGuestAnnouncements<T extends { title: string }>(announcements: T[]): T[] {
  return announcements.filter((announcement) => !isDevAnnouncement(announcement.title));
}
