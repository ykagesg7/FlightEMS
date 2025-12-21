import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface ComingSoonBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ComingSoonBadge Component
 * Coming Soon表示用のバッジコンポーネント
 */
export const ComingSoonBadge: React.FC<ComingSoonBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-full bg-whiskyPapa-yellow/20 border border-whiskyPapa-yellow/50 text-whiskyPapa-yellow font-bold ${sizeClasses[size]} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        <Clock className={iconSizes[size]} />
      </motion.div>
      <span>COMING SOON</span>
    </motion.div>
  );
};

