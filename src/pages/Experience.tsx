import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plane, Lock, CheckCircle, ArrowRight, Calendar, Mic } from 'lucide-react';
import { useGamification } from '../hooks/useGamification';
import { RankBadge } from '../components/marketing/RankBadge';
import { ComingSoonBadge } from '../components/marketing/ComingSoonBadge';
import { RANK_INFO } from '../types/gamification';

/**
 * Experience Page (Coming Soon)
 * Wingmanランク限定の体験搭乗予約機能のComing Soonページ
 */
const Experience: React.FC = () => {
  const { profile, rankInfo, isLoadingProfile } = useGamification();
  const isWingman = profile?.rank === 'wingman';
  const currentRankInfo = profile ? RANK_INFO[profile.rank] : null;

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center p-4">
        <div className="text-whiskyPapa-yellow text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-whiskyPapa-black to-whiskyPapa-black-dark">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <ComingSoonBadge size="lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-whiskyPapa-yellow"
          >
            FLY WITH US
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto"
          >
            Wingmanランク限定の体験搭乗プログラム
            <br />
            承認後、予約受付を開始します
          </motion.p>

          {/* ランク表示 */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col items-center gap-4 mt-8"
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
        </div>
      </section>

      {/* Coming Soon Message */}
      <section className="py-20 bg-whiskyPapa-black-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-whiskyPapa-yellow mb-6">
              承認待ち中
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              体験搭乗プログラムは現在、承認待ちの状態です。
              <br />
              承認が完了次第、Wingmanランクのユーザー向けに予約受付を開始いたします。
            </p>
            <div className="bg-whiskyPapa-black border border-whiskyPapa-yellow/30 rounded-lg p-6">
              <p className="text-gray-400 text-sm">
                この機能はまだ実装されていません。承認後、実装を開始します。
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Preview */}
      <section className="py-20 bg-whiskyPapa-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12 text-whiskyPapa-yellow"
          >
            予定されている機能
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/60 transition-colors bg-whiskyPapa-black-light"
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isWingman && profile && (
        <section className="py-20 bg-whiskyPapa-black-dark">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-whiskyPapa-yellow mb-4">
                Wingmanランクを目指そう
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                現在のランク: <span className="font-bold" style={{ color: currentRankInfo?.color }}>{currentRankInfo?.displayName}</span>
                <br />
                体験搭乗に参加するには、Wingmanランクまでランクアップが必要です。
              </p>
              <Link
                to="/mission"
                className="inline-flex items-center gap-2 px-8 py-4 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow-light transition-colors"
              >
                ミッションダッシュボードへ
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Experience;

