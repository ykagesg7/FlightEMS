import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import React from 'react';
import MDXLoader from '../../../components/mdx/MDXLoader';

export type MissionBlogPost = {
  id: string;
  contentId: string;
  title: string;
  excerpt: string;
  author: 'narrator' | 'pilot' | 'staff';
  publishedAt: string;
};

interface BlogTabProps {
  missionBlogPosts: MissionBlogPost[];
  selectedPostId: string | null;
  setSelectedPostId: (id: string | null) => void;
}

export const BlogTab: React.FC<BlogTabProps> = ({
  missionBlogPosts,
  selectedPostId,
  setSelectedPostId,
}) => {
  const selectedPost = missionBlogPosts.find((post) => post.id === selectedPostId) || null;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-whiskyPapa-yellow mb-4">SKY NOTES</h2>
        <p className="text-gray-300 text-lg">
          Whisky Papa のコクピット思考を共有する会員向けブログ。沿革・競技の舞台裏・機体思想をここに集約。
        </p>
      </motion.div>

      {/* 詳細ビュー */}
      {selectedPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <button
            onClick={() => setSelectedPostId(null)}
            className="inline-flex items-center text-gray-300 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            記事一覧に戻る
          </button>

          <div className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-whiskyPapa-yellow/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-whiskyPapa-yellow" />
              </div>
              <div>
                <p className="text-xs text-gray-400">
                  {selectedPost.author === 'narrator'
                    ? 'Briefing Officer'
                    : selectedPost.author === 'pilot'
                      ? 'Master Instructor'
                      : 'Staff'}
                </p>
                <p className="text-sm font-semibold text-whiskyPapa-yellow">
                  {selectedPost.author === 'narrator'
                    ? 'Jun'
                    : selectedPost.author === 'pilot'
                      ? 'Masa'
                      : 'Team'}
                </p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{selectedPost.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
              <Calendar className="w-4 h-4" />
              <time dateTime={selectedPost.publishedAt}>
                {new Date(selectedPost.publishedAt).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <MDXLoader contentId={selectedPost.contentId} />
          </div>
        </motion.div>
      )}

      {/* 一覧ビュー */}
      {!selectedPost && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missionBlogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg overflow-hidden hover:border-whiskyPapa-yellow/60 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedPostId(post.id)}
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-whiskyPapa-yellow/20 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-whiskyPapa-yellow" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">
                        {post.author === 'narrator'
                          ? 'Briefing Officer'
                          : post.author === 'pilot'
                            ? 'Master Instructor'
                            : 'Staff'}
                      </p>
                      <p className="text-sm font-semibold text-whiskyPapa-yellow">
                        {post.author === 'narrator' ? 'Jun' : post.author === 'pilot' ? 'Masa' : 'Team'}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
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

          {missionBlogPosts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">まだ記事がありません。</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

