import { describe, expect, it } from 'vitest';
import {
  normalizeNotificationTime,
  notificationTimeForInput,
  serializeNotificationSettings,
} from '@/pages/profile/hooks/useNotificationSettings';

describe('useNotificationSettings helpers', () => {
  it('normalizes time formats consistently', () => {
    expect(normalizeNotificationTime('09:00')).toBe('09:00:00');
    expect(normalizeNotificationTime('09:00:00')).toBe('09:00:00');
    expect(notificationTimeForInput('09:00:00')).toBe('09:00');
  });

  it('serializes settings with normalized time', () => {
    const a = serializeNotificationSettings({
      learning_reminder_enabled: true,
      notification_time: '09:00',
    });
    const b = serializeNotificationSettings({
      learning_reminder_enabled: true,
      notification_time: '09:00:00',
    });
    expect(a).toBe(b);
  });
});
