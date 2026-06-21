import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '../../../utils/supabase';

export interface NotificationSettings {
  id?: string;
  user_id?: string;
  learning_reminder_enabled: boolean;
  new_content_enabled: boolean;
  announcement_enabled: boolean;
  mission_update_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_time: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  learning_reminder_enabled: true,
  new_content_enabled: true,
  announcement_enabled: true,
  mission_update_enabled: true,
  email_notifications_enabled: false,
  notification_time: '09:00:00',
};

export type NotificationPersistStatus = 'idle' | 'saving' | 'saved' | 'error';

const PERSIST_FIELDS: Array<keyof NotificationSettings> = [
  'learning_reminder_enabled',
  'new_content_enabled',
  'announcement_enabled',
  'mission_update_enabled',
  'email_notifications_enabled',
  'notification_time',
];

/** Normalize DB `HH:MM:SS` and input `HH:MM` to a stable persisted value. */
export function normalizeNotificationTime(value: string | null | undefined): string {
  if (!value?.trim()) return '09:00:00';
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

/** Value for `<input type="time">` (HH:MM). */
export function notificationTimeForInput(value: string | null | undefined): string {
  const normalized = normalizeNotificationTime(value);
  return normalized.slice(0, 5);
}

export function serializeNotificationSettings(
  settings: Partial<NotificationSettings>,
): string {
  const snapshot: Record<string, boolean | string> = {};
  for (const key of PERSIST_FIELDS) {
    if (key === 'notification_time') {
      snapshot[key] = normalizeNotificationTime(settings.notification_time);
      continue;
    }
    snapshot[key] = Boolean(settings[key] ?? DEFAULT_SETTINGS[key]);
  }
  return JSON.stringify(snapshot);
}

export function useNotificationSettings(
  userId: string | undefined,
  options?: { onPersisted?: () => void },
) {
  const [settings, setSettings] = useState<Partial<NotificationSettings>>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persistStatus, setPersistStatus] = useState<NotificationPersistStatus>('idle');
  const skipAutoSaveRef = useRef(true);
  const debounceRef = useRef<number>();
  const savedStatusTimerRef = useRef<number>();
  const settingsRef = useRef(settings);
  const lastPersistedSnapshotRef = useRef<string | null>(null);
  const onPersistedRef = useRef(options?.onPersisted);
  settingsRef.current = settings;
  onPersistedRef.current = options?.onPersisted;

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceRef.current);
      window.clearTimeout(savedStatusTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        skipAutoSaveRef.current = true;
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch notification settings:', error);
          lastPersistedSnapshotRef.current = serializeNotificationSettings(DEFAULT_SETTINGS);
        } else if (data) {
          const normalized = {
            ...data,
            notification_time: normalizeNotificationTime(data.notification_time),
          };
          setSettings(normalized);
          lastPersistedSnapshotRef.current = serializeNotificationSettings(normalized);
        } else {
          lastPersistedSnapshotRef.current = serializeNotificationSettings(DEFAULT_SETTINGS);
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
      } finally {
        setIsLoading(false);
        skipAutoSaveRef.current = false;
      }
    };

    void fetchSettings();
  }, [userId]);

  const saveSettings = useCallback(async (overrides?: Partial<NotificationSettings>) => {
    if (!userId) {
      return { error: new Error('ユーザーが認証されていません') };
    }

    setIsSaving(true);
    try {
      const merged = { ...settingsRef.current, ...overrides };
      const payload = {
        user_id: userId,
        learning_reminder_enabled: merged.learning_reminder_enabled ?? DEFAULT_SETTINGS.learning_reminder_enabled,
        new_content_enabled: merged.new_content_enabled ?? DEFAULT_SETTINGS.new_content_enabled,
        announcement_enabled: merged.announcement_enabled ?? DEFAULT_SETTINGS.announcement_enabled,
        mission_update_enabled: merged.mission_update_enabled ?? DEFAULT_SETTINGS.mission_update_enabled,
        email_notifications_enabled: merged.email_notifications_enabled ?? DEFAULT_SETTINGS.email_notifications_enabled,
        notification_time: normalizeNotificationTime(merged.notification_time),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        return { error };
      }

      lastPersistedSnapshotRef.current = serializeNotificationSettings(payload);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('保存に失敗しました') };
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoading || !userId || skipAutoSaveRef.current) return;

    const snapshot = serializeNotificationSettings(settings);
    if (snapshot === lastPersistedSnapshotRef.current) {
      return;
    }

    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void (async () => {
        setPersistStatus('saving');
        const { error } = await saveSettings();
        if (error) {
          setPersistStatus('error');
          return;
        }
        setPersistStatus('saved');
        onPersistedRef.current?.();
        window.clearTimeout(savedStatusTimerRef.current);
        savedStatusTimerRef.current = window.setTimeout(() => {
          setPersistStatus('idle');
        }, 2000);
      })();
    }, 300);

    return () => window.clearTimeout(debounceRef.current);
  }, [isLoading, saveSettings, settings, userId]);

  const updateSetting = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    const nextValue = key === 'notification_time'
      ? normalizeNotificationTime(value as string | null)
      : value;
    setSettings((prev) => ({ ...prev, [key]: nextValue }));
    setPersistStatus('idle');
  }, []);

  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setPersistStatus('idle');
  }, []);

  return {
    settings,
    setSettings,
    isLoading,
    isSaving,
    persistStatus,
    saveSettings,
    updateSetting,
    toggleSetting,
  };
}
