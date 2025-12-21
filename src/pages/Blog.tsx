import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar } from 'lucide-react';

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

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-whiskyPapa-yellow mb-4">SKY NOTES</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Whisky Papaチームからの最新情報と、パイロット・ナレーター・スタッフによるブログ
          </p>
        </motion.div>

        {/* ブログ記事一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {samplePosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="bg-whiskyPapa-black-light border border-whiskyPapa-yellow/30 rounded-lg overflow-hidden hover:border-whiskyPapa-yellow/60 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.slug}`} className="block h-full">
                <div className="p-6">
                  {/* 著者情報 */}
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

                  {/* タイトル */}
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">{post.title}</h2>

                  {/* 抜粋 */}
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  )}

                  {/* 日付 */}
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
              </Link>
            </motion.article>
          ))}
        </div>

        {/* 記事がない場合 */}
        {samplePosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">まだ記事がありません。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

