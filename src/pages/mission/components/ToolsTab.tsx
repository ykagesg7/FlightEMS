import { motion } from 'framer-motion';
import { BookOpen, Plane, Target } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ToolsTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-whiskyPapa-yellow">FLIGHT ACADEMY TOOLS</h2>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">学習と実践のためのツール集</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Flight Planner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors"
          >
            <Plane className="w-12 h-12 text-whiskyPapa-yellow mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Flight Planner</h3>
            <p className="text-gray-300 mb-4">
              出発地・目的地・経由地を設定し、高度・速度・気象条件を考慮した詳細なフライトプランを作成できます。
            </p>
            <button
              onClick={() => navigate('/planning')}
              className="w-full px-4 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow/80 transition-colors"
            >
              プランナーを開く
            </button>
          </motion.div>

          {/* Articles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors"
          >
            <BookOpen className="w-12 h-12 text-whiskyPapa-yellow mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Articles</h3>
            <p className="text-gray-300 mb-4">
              航空に関する記事を読んで知識を深め、いいねやコメントでコミュニティと交流できます。
            </p>
            <button
              onClick={() => navigate('/articles')}
              className="w-full px-4 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow/80 transition-colors"
            >
              記事を読む
            </button>
          </motion.div>

          {/* CPL Quiz */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors"
          >
            <Target className="w-12 h-12 text-whiskyPapa-yellow mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">CPL Quiz</h3>
            <p className="text-gray-300 mb-4">
              CPL（商業操縦士）試験対策の4択クイズ。科目別・モード別で学習し、理解度を確認できます。
            </p>
            <button
              onClick={() => navigate('/test')}
              className="w-full px-4 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow/80 transition-colors"
            >
              クイズに挑戦
            </button>
          </motion.div>
        </div>

        {/* Academy Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors mb-8"
        >
          <div className="flex items-start gap-4">
            <BookOpen className="w-12 h-12 text-whiskyPapa-yellow flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">Academy</h3>
              <p className="text-gray-300 mb-4">
                体系的に学習コンテンツを学び、進捗を管理できます。カテゴリ別・検索・タグで効率的に学習を進めましょう。
              </p>
              <button
                onClick={() => navigate('/articles')}
                className="px-6 py-2 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow/80 transition-colors"
              >
                学習を開始
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

