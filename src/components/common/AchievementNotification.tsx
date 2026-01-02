import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export type AchievementType = 'rank_up' | 'milestone' | 'xp_gained' | 'streak' | 'ppl_rank';

interface AchievementNotificationProps {
  type: AchievementType;
  title: string;
  message?: string;
  value?: string | number;
  icon?: string;
  onClose?: () => void;
  duration?: number;
  top?: number; // 位置調整用（オプション）
}

/**
 * 達成通知コンポーネント
 */
export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  type,
  title,
  message,
  value,
  icon,
  onClose,
  duration = 5000,
  top = 16,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 500); // アニメーション完了後にコールバック
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // タイプ別のスタイル
  const typeStyles = {
    rank_up: {
      bgColor: 'bg-gradient-to-r from-yellow-600 to-yellow-400',
      borderColor: 'border-yellow-400',
      icon: icon || '⭐',
    },
    milestone: {
      bgColor: 'bg-gradient-to-r from-blue-600 to-blue-400',
      borderColor: 'border-blue-400',
      icon: icon || '🎯',
    },
    xp_gained: {
      bgColor: 'bg-gradient-to-r from-green-600 to-green-400',
      borderColor: 'border-green-400',
      icon: icon || '✨',
    },
    streak: {
      bgColor: 'bg-gradient-to-r from-orange-600 to-orange-400',
      borderColor: 'border-orange-400',
      icon: icon || '🔥',
    },
    ppl_rank: {
      bgColor: 'bg-gradient-to-r from-cyan-600 to-cyan-400',
      borderColor: 'border-cyan-400',
      icon: icon || '🎖️',
    },
  };

  const style = typeStyles[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-4 z-50 max-w-md"
          style={{ top: `${top}px` }}
        >
          <div
            className={`${style.bgColor} border-2 ${style.borderColor} rounded-lg shadow-2xl p-6 text-white`}
          >
            <div className="flex items-start gap-4">
              {/* アイコン */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-4xl"
              >
                {style.icon}
              </motion.div>

              {/* コンテンツ */}
              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-1"
                >
                  {title}
                </motion.h3>
                {message && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm opacity-90"
                  >
                    {message}
                  </motion.p>
                )}
                {value !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="mt-2 text-2xl font-bold"
                  >
                    {value}
                  </motion.div>
                )}
              </div>

              {/* 閉じるボタン */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose?.(), 500);
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* プログレスバー */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div className="h-full bg-white" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * 通知管理用のフック
 */
export const useAchievementNotification = () => {
  const [notifications, setNotifications] = useState<
    Array<AchievementNotificationProps & { id: string }>
  >([]);

  const showNotification = (notification: AchievementNotificationProps) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = { ...notification, id };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const NotificationContainer: React.FC = () => (
    <>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            position: 'fixed',
            top: `${20 + index * 120}px`,
            right: '16px',
            zIndex: 9999,
          }}
        >
          <AchievementNotification
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </>
  );

  return { showNotification, NotificationContainer };
};

export default AchievementNotification;

