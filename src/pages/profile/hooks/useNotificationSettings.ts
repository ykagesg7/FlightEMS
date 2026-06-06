import { useCallback, useEffect, useState } from 'react';
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

export function useNotificationSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<Partial<NotificationSettings>>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch notification settings:', error);
        } else if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
      } finally {
        setIsLoading(false);
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
      const payload = { ...settings, ...overrides };
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(
          {
            user_id: userId,
            ...payload,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );

      if (error) {
        return { error };
      }

      setSettings(payload);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('保存に失敗しました') };
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId]);

  const updateSetting = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  return {
    settings,
    setSettings,
    isLoading,
    isSaving,
    saveSettings,
    updateSetting,
    toggleSetting,
  };
}
