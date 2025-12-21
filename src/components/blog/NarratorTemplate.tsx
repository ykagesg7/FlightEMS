import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

interface NarratorTemplateProps {
  title: string;
  date: string;
  content: React.ReactNode;
}

/**
 * NarratorTemplate Component
 * Junさん（ナレーター）のキャラクターを活かしたブログテンプレート
 * 脚本・実況風の特別なスタイリング
 */
export const NarratorTemplate: React.FC<NarratorTemplateProps> = ({ title, date, content }) => {
  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <motion.div
          className="mb-8 pb-8 border-b border-whiskyPapa-yellow/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-whiskyPapa-yellow/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-whiskyPapa-yellow" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Briefing Officer</p>
              <p className="text-lg font-bold text-whiskyPapa-yellow">Jun (ナレーター)</p>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-gray-400 text-sm">{date}</p>
        </motion.div>

        {/* コンテンツ */}
        <motion.div
          className="prose prose-invert prose-lg max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 脚本風のスタイリング */}
          <div className="space-y-6">
            {content}
          </div>
        </motion.div>

        {/* フッター */}
        <motion.div
          className="mt-12 pt-8 border-t border-whiskyPapa-yellow/30 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-gray-400 text-sm">- End of Briefing -</p>
        </motion.div>
      </div>
    </div>
  );
};

