import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NarratorTemplate } from '../components/blog/NarratorTemplate';
import MDXLoader from '../components/mdx/MDXLoader';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // サンプル記事データ
  const samplePost = {
    slug: 'first-flight-briefing',
    title: '初フライトへの招集',
    author: 'narrator' as const,
    date: '2024年1月15日',
    content: `
# 初フライトへの招集

本日、新たなミッションが開始されます。観客の皆さん、準備はできていますか？

## ミッション概要

Whisky Papaへようこそ。ここから、あなたの空への旅が始まります。

### ステップ1: 観客として

まずは、私たちのパフォーマンスを楽しんでください。
圧倒的な映像美と、エアロバティックの技術を目の当たりにしてください。

### ステップ2: 訓練生として

フライトプランナーやクイズを「ミッション」として体験してください。
パイロットの知性を学び、空への理解を深めましょう。

### ステップ3: 僚機として

ランクを上げたあなただけが、限定グッズや体験搭乗へのアクセス権を得られます。
観客から僚機へ。あなたの成長を、私たちは見守っています。

---

**Briefing Officer: Jun**

"準備はいいか？それでは、ミッション開始だ。"
    `,
  };

  // 将来的には、slugに基づいてMDXファイルを読み込む
  // 現在はサンプルデータを使用

  return (
    <div className="min-h-screen bg-whiskyPapa-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-whiskyPapa-yellow hover:text-whiskyPapa-yellow-light mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          ブログ一覧に戻る
        </Link>

        <NarratorTemplate
          title={samplePost.title}
          date={samplePost.date}
          content={
            <div className="text-white">
              <MDXLoader contentId={slug || samplePost.slug} />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default BlogDetail;

