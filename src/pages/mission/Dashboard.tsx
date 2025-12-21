import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';
import { useAuthStore } from '../../stores/authStore';
import RankBadge from '../../components/marketing/RankBadge';
import MissionCard from '../../components/marketing/MissionCard';
import { ComingSoonBadge } from '../../components/marketing/ComingSoonBadge';
import { Trophy, TrendingUp, Target, BookOpen, Plane, Lock, CheckCircle, Calendar, Mic } from 'lucide-react';
import { RANK_INFO } from '../../types/gamification';

// サンプルブログ記事データ（将来的にはMDXから読み込む）
const samplePosts = [
  {
    id: '1',
    slug: 'first-flight-briefing',
    title: '初フライトへの招集',
    author: 'narrator' as const,
    excerpt: '本日、新たなミッションが開始されます。観客の皆さん、準備はできていますか？',
    published_at: '2024-01-15',
  },
  {
    id: '2',
    slug: 'wingman-program-launch',
    title: 'Wingman Program 開始',
    author: 'narrator' as const,
    excerpt: '観客から僚機へ。あなたの成長をサポートする新プログラムが始まります。',
    published_at: '2024-01-10',
  },
];

/**
 * Mission Dashboard Page
 * ランク・バッジ確認とミッション一覧、ブログ、体験搭乗情報を統合
 */
const MissionDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'missions' | 'blog' | 'experience' | 'planning'>('missions');
  const {
    profile,
    rankInfo,
    xpToNextRank,
    rankProgress,
    isLoadingProfile,
  } = useGamification();

  // 認証ガード: 未ログイン時は/authへリダイレクト
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  // ユーザーがログインしていない場合はローディング表示（リダイレクト中）
  if (!user) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskyPapa-yellow mx-auto mb-4"></div>
          <p className="text-gray-400">リダイレクト中...</p>
        </div>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskyPapa-yellow mx-auto mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ローディングが完了したが、プロフィールが取得できなかった場合のみエラー表示
  if (!isLoadingProfile && (!profile || !rankInfo)) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">プロフィールを読み込めませんでした</p>
        </div>
      </div>
    );
  }

  const oneTimeMissions = profile.available_missions.filter(
    (m) => m.mission_type === 'one_time'
  );
  const dailyMissions = profile.available_missions.filter(
    (m) => m.mission_type === 'daily'
  );
  const weeklyMissions = profile.available_missions.filter(
    (m) => m.mission_type === 'weekly'
  );

  const completedMissionsMap = new Map(
    profile.completed_missions.map((m) => [m.mission_id, m])
  );

  const isWingman = profile.rank === 'wingman';
  const currentRankInfo = RANK_INFO[profile.rank];

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-whiskyPapa-yellow">
            MISSION DASHBOARD
          </h1>
          <p className="text-gray-400">あなたの進捗と次のミッション</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 border-b border-whiskyPapa-yellow/20">
          <button
            onClick={() => setActiveTab('missions')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'missions'
                ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-5 h-5 inline-block mr-2" />
            ミッション
          </button>
          <button
            onClick={() => setActiveTab('blog')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'blog'
                ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5 inline-block mr-2" />
            ブログ
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'experience'
                ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plane className="w-5 h-5 inline-block mr-2" />
            体験搭乗
          </button>
          <button
            onClick={() => setActiveTab('planning')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'planning'
                ? 'text-whiskyPapa-yellow border-b-2 border-whiskyPapa-yellow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plane className="w-5 h-5 inline-block mr-2" />
            飛行計画
          </button>
        </div>

        {/* Rank & XP Section - Always visible */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Current Rank */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light text-center"
          >
            <RankBadge rank={profile.rank} size="lg" animated />
            <h3 className="text-xl font-bold mt-4" style={{ color: rankInfo.color }}>
              {rankInfo.displayName}
            </h3>
            <p className="text-sm text-gray-400 mt-2">現在のランク</p>
          </motion.div>

          {/* Current XP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-whiskyPapa-yellow" />
              <h3 className="text-xl font-bold">総獲得XP</h3>
            </div>
            <div className="text-4xl font-bold text-whiskyPapa-yellow mb-2">
              {profile.xp_points}
            </div>
            <p className="text-sm text-gray-400">
              {rankInfo.nextRank
                ? `次のランクまで: ${xpToNextRank} XP`
                : '最高ランク達成！'}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-whiskyPapa-yellow" />
              <h3 className="text-xl font-bold">ランクアップ進捗</h3>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rankProgress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-4 rounded-full bg-whiskyPapa-yellow"
              />
            </div>
            <p className="text-sm text-gray-400">
              {rankInfo.nextRank
                ? `${rankProgress.toFixed(1)}% 完了`
                : '最高ランク達成'}
            </p>
          </motion.div>
        </div>

        {/* Tab Content */}
        {activeTab === 'missions' && (
          <div className="space-y-8">
            {/* One-time Missions */}
            {oneTimeMissions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-whiskyPapa-yellow" />
                <h2 className="text-2xl font-bold">通常ミッション</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {oneTimeMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isCompleted={completedMissionsMap.has(mission.id)}
                    completedAt={
                      completedMissionsMap.get(mission.id)?.completed_at
                    }
                    userRank={profile.rank}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Daily Missions */}
          {dailyMissions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-whiskyPapa-yellow" />
                <h2 className="text-2xl font-bold">デイリーミッション</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isCompleted={completedMissionsMap.has(mission.id)}
                    completedAt={
                      completedMissionsMap.get(mission.id)?.completed_at
                    }
                    userRank={profile.rank}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Weekly Missions */}
          {weeklyMissions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-whiskyPapa-yellow" />
                <h2 className="text-2xl font-bold">ウィークリーミッション</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isCompleted={completedMissionsMap.has(mission.id)}
                    completedAt={
                      completedMissionsMap.get(mission.id)?.completed_at
                    }
                    userRank={profile.rank}
                  />
                ))}
              </div>
            </section>
          )}

            {/* No Missions Available */}
            {profile.available_missions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  利用可能なミッションはありません
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-whiskyPapa-yellow mb-4">SKY NOTES</h2>
              <p className="text-gray-300 text-lg">
                Whisky Papaチームからの最新情報と、パイロット・ナレーター・スタッフによるブログ
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {samplePosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg overflow-hidden hover:border-whiskyPapa-yellow/60 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-whiskyPapa-yellow/20 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-whiskyPapa-yellow" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {post.author === 'narrator' ? 'Briefing Officer' : post.author === 'pilot' ? 'Master Instructor' : 'Staff'}
                        </p>
                        <p className="text-sm font-semibold text-whiskyPapa-yellow">
                          {post.author === 'narrator' ? 'Jun' : post.author === 'pilot' ? 'Masa' : 'Staff'}
                        </p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {samplePosts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">まだ記事がありません。</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <ComingSoonBadge size="lg" className="mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-whiskyPapa-yellow">
                FLY WITH US
              </h2>
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
              <h3 className="text-2xl font-bold text-whiskyPapa-yellow mb-4">
                承認待ち中
              </h3>
              <p className="text-gray-300 text-lg mb-6">
                体験搭乗プログラムは現在、承認待ちの状態です。
                <br />
                承認が完了次第、Wingmanランクのユーザー向けに予約受付を開始いたします。
              </p>
              <div className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg p-6">
                <p className="text-gray-400 text-sm">
                  この機能はまだ実装されていません。承認後、実装を開始します。
                </p>
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
                <h3 className="text-2xl font-bold text-whiskyPapa-yellow mb-4">
                  Wingmanランクを目指そう
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  現在のランク: <span className="font-bold" style={{ color: currentRankInfo.color }}>{currentRankInfo.displayName}</span>
                  <br />
                  体験搭乗に参加するには、Wingmanランクまでランクアップが必要です。
                </p>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-whiskyPapa-yellow">
                FLIGHT PLANNING
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                実践的なフライトプラン作成ツール
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors"
                >
                  <Plane className="w-12 h-12 text-whiskyPapa-yellow mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">フライトプランナー</h3>
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

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 border border-whiskyPapa-yellow/30 rounded-lg bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 transition-colors"
                >
                  <Target className="w-12 h-12 text-whiskyPapa-yellow mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">主な機能</h3>
                  <ul className="text-gray-300 space-y-2 mb-4">
                    <li>• ルート計算と距離測定</li>
                    <li>• 飛行時間（ETE）と到着時刻（ETA）の計算</li>
                    <li>• 対気速度（TAS）とマッハ数の計算</li>
                    <li>• 気象情報の表示</li>
                    <li>• 地図上での視覚的な確認</li>
                  </ul>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded-lg p-6"
              >
                <h3 className="text-xl font-bold text-whiskyPapa-yellow mb-4">使い方</h3>
                <ol className="text-gray-300 space-y-3 list-decimal list-inside">
                  <li>「プランナーを開く」ボタンをクリックしてフライトプランナーページに移動</li>
                  <li>出発地と目的地を選択（空港コードまたは地名で検索可能）</li>
                  <li>必要に応じて経由地を追加</li>
                  <li>飛行高度と速度を設定</li>
                  <li>気象条件を確認し、プランを保存</li>
                </ol>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissionDashboard;

