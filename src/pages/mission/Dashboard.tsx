import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGamification } from '../../hooks/useGamification';
import { useAuthStore } from '../../stores/authStore';
import MissionCard from '../../components/marketing/MissionCard';
import { MissionRankSection } from './components/MissionRankSection';
import { MissionTabs } from './components/MissionTabs';


/**
 * Mission Dashboard Page
 * ランク・バッジ確認とミッション一覧、ブログ、体験搭乗情報を統合
 */
const MissionDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'blog' | 'test' | 'planning' | 'experience'>('blog');
  const { profile, rankInfo, xpToNextRank, rankProgress, isLoadingProfile } = useGamification();

  // 認証ガード: 未ログイン時は/authへリダイレクト
  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  // クエリパラメータから初期タブを決定
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'blog' || tab === 'test' || tab === 'planning' || tab === 'experience') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // タブ変更時の処理（外部ページへのナビゲーションまたはタブ表示）
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);

    // 外部ページへのナビゲーション
    if (tab === 'blog') {
      navigate('/articles');
      return;
    } else if (tab === 'test') {
      navigate('/test');
      return;
    } else if (tab === 'planning') {
      navigate('/planning');
      return;
    }

    // 体験搭乗はタブコンテンツとして表示
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };


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

  // TypeScriptの型チェッカーに、profileとrankInfoが確実に存在することを伝える
  if (!profile || !rankInfo) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskyPapa-yellow mx-auto mb-4"></div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  const oneTimeMissions = profile.available_missions.filter(
    (m) => m.mission_type === 'one_time'
  );
  const weeklyMissions = profile.available_missions.filter(
    (m) => m.mission_type === 'weekly'
  );

  const completedMissionsMap = new Map(
    profile.completed_missions.map((m) => [m.mission_id, m])
  );

  // ミッションをカテゴリごとに分類
  const blogMissions = oneTimeMissions.filter(
    (m) => m.required_action === 'article_read' || m.required_action === 'lesson_complete'
  );
  const testMissions = oneTimeMissions.filter(
    (m) => m.required_action === 'quiz_pass'
  );
  const planningMissions = oneTimeMissions.filter(
    (m) => m.required_action === 'plan_create'
  );

  // 各カテゴリから直近1つを選択（未完了を優先、完了済みは最新を選択）
  const getLatestMission = (missions: typeof oneTimeMissions) => {
    if (missions.length === 0) return null;

    // 未完了のミッションを優先
    const incompleteMissions = missions.filter(
      (m) => !completedMissionsMap.has(m.id)
    );

    if (incompleteMissions.length > 0) {
      // 未完了のミッションをcreated_atでソートして最新を選択
      return incompleteMissions.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    }

    // すべて完了済みの場合は最新を選択
    return missions.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  const latestBlogMission = getLatestMission(blogMissions);
  const latestTestMission = getLatestMission(testMissions);
  const latestPlanningMission = getLatestMission(planningMissions);

  // 表示する通常ミッション（各カテゴリから1つずつ）
  const displayedOneTimeMissions = [
    latestBlogMission,
    latestTestMission,
    latestPlanningMission,
  ].filter((m): m is typeof oneTimeMissions[0] => m !== null);

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
        <MissionTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Rank & XP Section - Always visible */}
        <MissionRankSection
          profile={profile}
          rankInfo={rankInfo}
          xpToNextRank={xpToNextRank}
          rankProgress={rankProgress}
        />

        {/* Missions Section - Always visible */}
        <div className="space-y-8 mb-12">
          {/* One-time Missions */}
          {displayedOneTimeMissions.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold">通常ミッション</h2>
                </motion.div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedOneTimeMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isCompleted={completedMissionsMap.has(mission.id)}
                    completedAt={completedMissionsMap.get(mission.id)?.completed_at}
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
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold">ウィークリーミッション</h2>
                </motion.div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    isCompleted={completedMissionsMap.has(mission.id)}
                    completedAt={completedMissionsMap.get(mission.id)?.completed_at}
                    userRank={profile.rank}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No Missions Available */}
          {oneTimeMissions.length === 0 && weeklyMissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">利用可能なミッションはありません</p>
            </div>
          )}
        </div>

        {/* Tab Content - Only for experience tab */}
        {activeTab === 'experience' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-whiskyPapa-yellow mb-4">体験搭乗</h2>
              <p className="text-gray-300 text-lg mb-6">
                体験搭乗プログラムは現在準備中です。
                <br />
                承認が完了次第、お知らせいたします。
              </p>
              <div className="inline-block px-4 py-2 bg-whiskyPapa-yellow/10 border border-whiskyPapa-yellow/30 rounded-lg">
                <p className="text-whiskyPapa-yellow font-semibold">承認待ち</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MissionDashboard;

