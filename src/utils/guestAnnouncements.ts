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

export function filterGuestAnnouncements<T extends { title: string }>(announcements: T[]): T[] {
  return announcements.filter((announcement) => !isDevAnnouncement(announcement.title));
}
