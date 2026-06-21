import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { fetchUnreadInAppNotifications, markInAppNotificationRead } from '../../utils/cohortApi';
import { Typography } from '../ui';

interface InAppNotificationItem {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
}

interface InAppNotificationBellProps {
  className?: string;
}

export const InAppNotificationBell: React.FC<InAppNotificationBellProps> = ({ className = '' }) => {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<InAppNotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }
    const { data, error } = await fetchUnreadInAppNotifications(user.id);
    if (error) {
      console.error('Failed to load in-app notifications:', error);
      return;
    }
    setItems((data ?? []) as InAppNotificationItem[]);
  }, [user?.id]);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const { error } = await markInAppNotificationRead(id);
    if (error) {
      void loadNotifications();
    }
  }, [loadNotifications]);

  if (!user || items.length === 0) return null;

  return (
    <div
      className={`rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-4 ${className}`}
      role="region"
      aria-label="お知らせ"
      aria-live="polite"
    >
      <Typography variant="body-sm" color="brand" className="font-semibold mb-2">
        お知らせ ({items.length})
      </Typography>
      <ul className="space-y-2">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="text-sm">
            {item.link_url ? (
              <Link
                to={item.link_url}
                className="font-medium text-[color:var(--hud-primary)] underline"
                onClick={() => void handleMarkRead(item.id)}
              >
                {item.title}
              </Link>
            ) : (
              <span className="font-medium">{item.title}</span>
            )}
            {item.body && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.body}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
