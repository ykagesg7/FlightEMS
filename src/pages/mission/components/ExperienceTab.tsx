import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Lock, Mic, Plane } from 'lucide-react';
import React from 'react';
import { ComingSoonBadge } from '../../../components/marketing/ComingSoonBadge';
import RankBadge from '../../../components/marketing/RankBadge';
import { RankInfo, UserRank } from '../../../types/gamification';

interface ExperienceTabProps {
  profile: {
    rank: UserRank;
  };
  isWingman: boolean;
  currentRankInfo: RankInfo;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({
  profile,
  isWingman,
  currentRankInfo,
}) => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <ComingSoonBadge size="lg" className="mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-whiskyPapa-yellow">FLY WITH US</h2>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
          Wingmanランク限定の体験搭乗プログラム
          <br />
          承認後、予約受付を開始します
        </p>
      </motion.div>

      {profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <RankBadge rank={profile.rank} size="lg" showLabel={true} animated={true} />
          {isWingman ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">準備完了 - 承認待ち</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Lock className="w-5 h-5" />
              <span>Wingmanランクが必要です</span>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-whiskyPapa-yellow mb-4">承認待ち中</h3>
        <p className="text-gray-300 text-lg mb-6">
          体験搭乗プログラムは現在、承認待ちの状態です。
          <br />
          承認が完了次第、Wingmanランクのユーザー向けに予約受付を開始いたします。
        </p>
        <div className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">この機能はまだ実装されていません。承認後、実装を開始します。</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
        {[
          {
            icon: Calendar,
            title: '予約フォーム',
            description: '希望日時を選択して体験搭乗を予約',
            color: 'text-blue-400',
          },
          {
            icon: Mic,
            title: 'Junさんからの招集',
            description: '予約完了後、Junさんからの招集命令ページ',
            color: 'text-purple-400',
          },
          {
            icon: Plane,
            title: '体験搭乗の流れ',
            description: '当日のスケジュールと注意事項の確認',
            color: 'text-green-400',
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/60 transition-colors bg-whiskyPapa-black-light"
          >
            <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
            <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {!isWingman && profile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-whiskyPapa-black-dark py-12 rounded-lg"
        >
          <h3 className="text-2xl font-bold text-whiskyPapa-yellow mb-4">Wingmanランクを目指そう</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            現在のランク:{' '}
            <span className="font-bold" style={{ color: currentRankInfo.color }}>
              {currentRankInfo.displayName}
            </span>
            <br />
            体験搭乗に参加するには、Wingmanランクまでランクアップが必要です。
          </p>
        </motion.div>
      )}
    </div>
  );
};

