import { motion } from 'framer-motion';
import { ArrowUpDown, Camera, Heart, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGallery } from '../../hooks/useGallery';
import { useAuthStore } from '../../stores/authStore';
import AdminEventPanel from './components/AdminEventPanel';
import AdminReviewPanel from './components/AdminReviewPanel';
import { PhotoGrid } from './components/PhotoGrid';
import { UploadModal } from './components/UploadModal';

type PublicTab = 'public' | 'my' | 'admin';
type SortType = 'newest' | 'likes';

const Gallery: React.FC = () => {
  const { user, profile } = useAuthStore();
  const {
    approvedPhotos,
    featuredPhotos,
    userPhotos,
    isLoadingApproved,
    toggleLike,
    deletePhoto,
    activeEvent,
    archivedEvents,
    eventMap,
  } = useGallery();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PublicTab>('public');
  const [sortType, setSortType] = useState<SortType>('newest');

  const isAdmin = useMemo(() => profile?.roll?.toLowerCase() === 'admin', [profile?.roll]);
  const isLoggedIn = !!user;

  const approvedWithLikes = useMemo(() => approvedPhotos || [], [approvedPhotos]);

  const activeApproved = useMemo(() => {
    if (!activeEvent) return [];
    return approvedWithLikes.filter((p) => p.event_id === activeEvent.id);
  }, [approvedWithLikes, activeEvent]);

  const top3 = useMemo(() => {
    const sorted = [...activeApproved].sort((a, b) => {
      const likesA = a.likes_count ?? 0;
      const likesB = b.likes_count ?? 0;
      if (likesA !== likesB) return likesB - likesA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return sorted.slice(0, 3);
  }, [activeApproved]);

  const sortedApproved = useMemo(() => {
    const base = [...activeApproved];
    if (sortType === 'likes') {
      base.sort((a, b) => {
        const likesA = a.likes_count ?? 0;
        const likesB = b.likes_count ?? 0;
        if (likesA !== likesB) return likesB - likesA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      base.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return base;
  }, [approvedWithLikes, sortType]);

  const myPhotos = useMemo(() => userPhotos || [], [userPhotos]);

  const archivedByEvent = useMemo(() => {
    const grouped: Record<string, typeof approvedWithLikes> = {};
    approvedWithLikes.forEach((p) => {
      if (activeEvent && p.event_id === activeEvent.id) return;
      if (!p.event_id) return;
      if (!grouped[p.event_id]) grouped[p.event_id] = [];
      grouped[p.event_id].push(p);
    });
    return grouped;
  }, [approvedWithLikes, activeEvent]);

  const canLike = (photo: typeof approvedWithLikes[number]) => {
    if (!photo.is_approved) return false;
    if (user && photo.user_id === user.id) return false;
    const ev = photo.event_id ? eventMap[photo.event_id] : undefined;
    if (!ev) return false;
    if (ev.status !== 'active') return false;
    if (ev.ends_at && new Date(ev.ends_at).getTime() < Date.now()) return false;
    return true;
  };

  const handleDeleteMyPhoto = async (photoId: string) => {
    const photo = myPhotos.find((p) => p.id === photoId);
    if (!photo) return;
    const ok = window.confirm('この写真を削除しますか？（一度削除すると失われます）');
    if (!ok) return;
    await deletePhoto({ photo });
  };

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-whiskyPapa-yellow mb-4">GALLERY</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            ファンの皆さんが撮影したWhisky Papaの写真を共有します。
          </p>

          {/* 投稿ボタン */}
          {user ? (
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-whiskyPapa-yellow text-whiskyPapa-black font-bold rounded-lg hover:bg-whiskyPapa-yellow-light transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Camera className="w-5 h-5" />
              写真を投稿
            </motion.button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-whiskyPapa-yellow text-whiskyPapa-yellow font-bold rounded-lg hover:bg-whiskyPapa-yellow/10 transition-colors"
            >
              ログインして投稿
            </Link>
          )}
        </motion.div>

        {/* タブ切り替え */}
        <div className="mb-8 flex justify-center gap-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-lg border ${activeTab === 'public'
              ? 'border-whiskyPapa-yellow text-whiskyPapa-yellow'
              : 'border-white/20 text-gray-300 hover:border-whiskyPapa-yellow/50 hover:text-white'
              } transition-colors`}
            onClick={() => setActiveTab('public')}
          >
            ギャラリー
          </button>
          {isLoggedIn && (
            <button
              className={`px-4 py-2 rounded-lg border ${activeTab === 'my'
                ? 'border-whiskyPapa-yellow text-whiskyPapa-yellow'
                : 'border-white/20 text-gray-300 hover:border-whiskyPapa-yellow/50 hover:text-white'
                } transition-colors`}
              onClick={() => setActiveTab('my')}
            >
              自分の投稿
            </button>
          )}
          {isAdmin && (
            <button
              className={`px-4 py-2 rounded-lg border ${activeTab === 'admin'
                ? 'border-whiskyPapa-yellow text-whiskyPapa-yellow'
                : 'border-white/20 text-gray-300 hover:border-whiskyPapa-yellow/50 hover:text-white'
                } transition-colors`}
              onClick={() => setActiveTab('admin')}
            >
              管理
            </button>
          )}
        </div>

        {activeTab === 'public' && (
          <>
            {activeEvent && (
              <div className="mb-6 rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div>
                    <div className="text-sm text-gray-400">アクティブイベント</div>
                    <div className="text-xl font-bold text-white">{activeEvent.title}</div>
                    {activeEvent.description && (
                      <div className="text-sm text-gray-300 mt-1">{activeEvent.description}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">
                    {activeEvent.ends_at
                      ? `投票締切: ${new Date(activeEvent.ends_at).toLocaleString()}`
                      : '投票締切: 未設定'}
                  </div>
                </div>
              </div>
            )}

            {/* 人気Top3 */}
            {top3.length > 0 && (
              <motion.section
                className="mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-red-400" />
                  <h2 className="text-2xl font-bold text-white">人気Top3</h2>
                </div>
                <PhotoGrid
                  photos={top3}
                  isLoggedIn={isLoggedIn}
                  canLike={canLike}
                  onToggleLike={(id, liked) => toggleLike({ photoId: id, userLiked: liked })}
                  layout="masonry"
                />
              </motion.section>
            )}

            {/* おすすめ */}
            {featuredPhotos.length > 0 && (
              <motion.section
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Star className="w-6 h-6 text-whiskyPapa-yellow" />
                  <h2 className="text-2xl font-bold text-whiskyPapa-yellow">おすすめ</h2>
                </div>
                <PhotoGrid photos={featuredPhotos} />
              </motion.section>
            )}

            {/* 並び替え + 全写真 */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="mb-4 flex items-center gap-3 justify-between">
                <h2 className="text-2xl font-bold text-white">すべての写真</h2>
                <button
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 text-gray-200 hover:border-whiskyPapa-yellow/60 hover:text-white transition-colors text-sm"
                  onClick={() => setSortType((prev) => (prev === 'newest' ? 'likes' : 'newest'))}
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortType === 'newest' ? '新着順' : 'いいね順'}
                </button>
              </div>
              <PhotoGrid
                photos={sortedApproved}
                isLoading={isLoadingApproved}
                isLoggedIn={isLoggedIn}
                canLike={canLike}
                onToggleLike={(id, liked) => toggleLike({ photoId: id, userLiked: liked })}
                layout="masonry"
              />
            </motion.section>
          </>
        )}

        {activeTab === 'my' && isLoggedIn && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-whiskyPapa-yellow" />
              <h2 className="text-2xl font-bold text-white">自分の投稿</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full bg-white/10 text-xs">承認待ち</span>
                </div>
                <PhotoGrid
                  photos={myPhotos.filter((p) => !p.is_approved)}
                  isLoggedIn={isLoggedIn}
                  onToggleLike={(id, liked) => toggleLike({ photoId: id, userLiked: liked })}
                  layout="masonry"
                  onDelete={(photo) => handleDeleteMyPhoto(photo.id)}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full bg-whiskyPapa-yellow/20 text-xs text-whiskyPapa-yellow">
                    承認済み
                  </span>
                </div>
                <PhotoGrid
                  photos={myPhotos.filter((p) => p.is_approved)}
                  isLoggedIn={isLoggedIn}
                  canLike={canLike}
                  onToggleLike={(id, liked) => toggleLike({ photoId: id, userLiked: liked })}
                  layout="masonry"
                  onDelete={(photo) => handleDeleteMyPhoto(photo.id)}
                />
              </div>
            </div>
          </motion.section>
        )}

        {activeTab === 'admin' && isAdmin && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            {/* イベント作成セクション */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">イベント管理</h2>
              <AdminEventPanel />
            </div>

            {/* 承認待ちの写真セクション */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">承認待ちの写真</h2>
              <AdminReviewPanel />
            </div>
          </motion.section>
        )}

        {/* 過去イベント一覧 */}
        {activeTab === 'public' && archivedEvents && archivedEvents.length > 0 && (
          <div className="mt-12 space-y-8">
            {archivedEvents.map((ev) => {
              const photos = archivedByEvent[ev.id] || [];
              if (!photos.length) return null;
              const top3Archived = [...photos].sort((a, b) => {
                const likesA = a.likes_count ?? 0;
                const likesB = b.likes_count ?? 0;
                if (likesA !== likesB) return likesB - likesA;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              }).slice(0, 3);
              return (
                <section key={ev.id} className="rounded-lg border border-white/10 bg-black/20 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-sm text-gray-400">過去イベント</div>
                      <div className="text-xl font-bold text-white">{ev.title}</div>
                      {ev.description && (
                        <div className="text-sm text-gray-300 mt-1">{ev.description}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {ev.ends_at ? `投票締切: ${new Date(ev.ends_at).toLocaleString()}` : '投票締切: 未設定'}
                    </div>
                  </div>

                  {top3Archived.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-red-400" />
                        <span className="font-semibold">Top3</span>
                      </div>
                      <PhotoGrid photos={top3Archived} layout="masonry" isLoggedIn={isLoggedIn} canLike={() => false} />
                    </div>
                  )}

                  <PhotoGrid photos={photos} layout="masonry" isLoggedIn={isLoggedIn} canLike={() => false} />
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* アップロードモーダル */}
      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};

export default Gallery;

