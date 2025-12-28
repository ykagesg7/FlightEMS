import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGamification } from '../../hooks/useGamification';
import { useAuthStore } from '../../stores/authStore';
import { RANK_INFO } from '../../types/gamification';
import { BlogTab } from './components/BlogTab';
import { ExperienceTab } from './components/ExperienceTab';
import { MissionRankSection } from './components/MissionRankSection';
import { MissionsTab } from './components/MissionsTab';
import { MissionTabs } from './components/MissionTabs';
import { ToolsTab } from './components/ToolsTab';
import { MissionBlogPost } from './types';

// 会員向けブログ（沿革/曲技飛行/機体詳細をここへ移設）
const missionBlogPosts: MissionBlogPost[] = [
  {
    id: 'team-history',
    contentId: 'team-history',
    title: 'Whisky Papa の歩みとミッション',
    excerpt: '2008年の結成から、岡南飛行場を拠点に世界選手権を目指すまでの物語。',
    author: 'pilot',
    publishedAt: '2025-06-10',
  },
  {
    id: 'what-is-aerobatics',
    contentId: 'what-is-aerobatics',
    title: '曲技飛行とは何か？競技のルールと魅力',
    excerpt: '1km立方体の空域で美しさと正確さを競う競技の仕組みと、安全の思想。',
    author: 'narrator',
    publishedAt: '2025-06-11',
  },
  {
    id: 'extra-300l-deep-dive',
    contentId: 'extra-300l-deep-dive',
    title: 'EXTRA 300L Deep Dive（機体詳細）',
    excerpt: '+/-10G を耐える機体構造と、計器を削ぎ落としたコクピット哲学。',
    author: 'staff',
    publishedAt: '2025-06-12',
  },
];

/**
 * Mission Dashboard Page
 * ランク・バッジ確認とミッション一覧、ブログ、体験搭乗情報を統合
 */
const MissionDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'missions' | 'blog' | 'experience' | 'tools'>('missions');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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
    if (tab === 'blog' || tab === 'experience' || tab === 'tools' || tab === 'missions') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // タブ変更時にクエリも同期（不要なパラメータは消す）
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSelectedPostId(null);
    const next = new URLSearchParams(searchParams);
    if (tab === 'missions') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
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
        <MissionTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Rank & XP Section - Always visible */}
        <MissionRankSection
          profile={profile}
          rankInfo={rankInfo}
          xpToNextRank={xpToNextRank}
          rankProgress={rankProgress}
        />

        {/* Tab Content */}
        {activeTab === 'missions' && (
          <MissionsTab
            profile={profile}
            oneTimeMissions={oneTimeMissions}
            dailyMissions={dailyMissions}
            weeklyMissions={weeklyMissions}
            completedMissionsMap={completedMissionsMap}
          />
        )}

        {activeTab === 'blog' && (
          <BlogTab
            missionBlogPosts={missionBlogPosts}
            selectedPostId={selectedPostId}
            setSelectedPostId={setSelectedPostId}
          />
        )}

        {activeTab === 'experience' && (
          <ExperienceTab profile={profile} isWingman={isWingman} currentRankInfo={currentRankInfo} />
        )}

        {activeTab === 'tools' && <ToolsTab />}
      </div>
    </div>
  );
};

export default MissionDashboard;

