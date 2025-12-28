import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';
import { useAuthStore } from '../../../stores/authStore';
import supabase from '../../../utils/supabase';

interface NotificationSettings {
  id: string;
  user_id: string;
  learning_reminder_enabled: boolean;
  new_content_enabled: boolean;
  announcement_enabled: boolean;
  mission_update_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_time: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface NotificationPreferencesProps {
  onError?: (error: string) => void;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onError }) => {
  const user = useAuthStore((state) => state.user);
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
    learning_reminder_enabled: true,
    new_content_enabled: true,
    announcement_enabled: true,
    mission_update_enabled: true,
    email_notifications_enabled: false,
    notification_time: '09:00:00',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 通知設定を取得
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116は「行が見つからない」エラー（初回ユーザーなど）
          console.error('Failed to fetch notification settings:', error);
          // デフォルト設定を使用
        } else if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('Error fetching notification settings:', err);
        onError?.('通知設定の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user, onError]);

  // 設定を保存
  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(
          {
            user_id: user.id,
            ...settings,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        throw error;
      }

      // 成功メッセージ（必要に応じて）
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存に失敗しました';
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (key === 'id' || key === 'user_id' || key === 'created_at' || key === 'updated_at') {
      return;
    }

    setSettings((prev: Partial<NotificationSettings>) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTimeChange = (time: string) => {
    setSettings((prev: Partial<NotificationSettings>) => ({
      ...prev,
      notification_time: time,
    }));
  };

  if (isLoading) {
    return (
      <Card variant="brand" padding="lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-primary border-t-transparent mx-auto mb-4"></div>
          <Typography variant="body-sm" color="muted">
            読み込み中...
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <Typography variant="h3" color="brand" className="text-xl font-bold mb-2">
          通知設定
        </Typography>
        <Typography variant="body-sm" color="muted">
          受け取りたい通知の種類を選択してください
        </Typography>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 通知タイプ */}
          <div className="space-y-4">
            <NotificationToggle
              label="学習リマインダー"
              description="毎日の学習時間目標や復習タイミングの通知"
              enabled={settings.learning_reminder_enabled ?? true}
              onChange={() => handleToggle('learning_reminder_enabled')}
            />

            <NotificationToggle
              label="新着コンテンツ"
              description="新しい記事やレッスンが追加されたときの通知"
              enabled={settings.new_content_enabled ?? true}
              onChange={() => handleToggle('new_content_enabled')}
            />

            <NotificationToggle
              label="お知らせ"
              description="重要なアナウンスメントやシステム更新の通知"
              enabled={settings.announcement_enabled ?? true}
              onChange={() => handleToggle('announcement_enabled')}
            />

            <NotificationToggle
              label="ミッション更新"
              description="ミッションの達成や新しいミッションの通知"
              enabled={settings.mission_update_enabled ?? true}
              onChange={() => handleToggle('mission_update_enabled')}
            />

            <NotificationToggle
              label="メール通知"
              description="メールでの通知を受け取る（上記の通知をメールでも受け取ります）"
              enabled={settings.email_notifications_enabled ?? false}
              onChange={() => handleToggle('email_notifications_enabled')}
            />
          </div>

          {/* 通知時間 */}
          <div>
            <label className="block mb-2">
              <Typography variant="body-sm" className="font-medium">
                通知時間
              </Typography>
            </label>
            <input
              type="time"
              value={settings.notification_time || '09:00:00'}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-brand-secondary-light text-white focus:outline-none"
            />
            <Typography variant="caption" color="muted" className="mt-1 block">
              毎日の通知を受け取る時間を設定できます
            </Typography>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t border-brand-primary/20">
            <Button variant="brand" onClick={handleSave} disabled={isSaving}>
              {isSaving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface NotificationToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ label, description, enabled, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border-2 border-brand-primary/20 bg-brand-secondary/50 hover:bg-brand-secondary transition-colors">
      <div className="flex-1">
        <Typography variant="body-sm" className="font-medium mb-1">
          {label}
        </Typography>
        <Typography variant="caption" color="muted">
          {description}
        </Typography>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 ${enabled ? 'bg-brand-primary' : 'bg-gray-300'
          }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
      </button>
    </div>
  );
};
