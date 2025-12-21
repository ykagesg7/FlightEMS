import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Typography, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { BookOpen, Plane, Target, TrendingUp, Award, Users, Shield } from 'lucide-react';

/**
 * Home Page (Landing Page)
 * Whisky Papa公式サイトのトップページ
 * Heroセクション + ミッション提示
 */
const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-screen bg-whiskyPapa-black text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Video Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-b from-whiskyPapa-black to-whiskyPapa-black-dark">
          {/* 将来的に動画背景を配置 */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-[url('/images/ContentImages/topgun1.jpg')] bg-cover bg-center" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="display" color="brand" className="mb-6 !text-5xl md:!text-7xl">
              WHISKY PAPA
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 max-w-3xl mx-auto"
          >
            <Typography variant="h3" className="text-gray-300 mb-4">
              ウイスキーパパ競技曲技飛行チーム
            </Typography>
            <Typography variant="body" className="text-gray-400 mb-4">
              世界選手権日本代表チームが母体となり、日本人初で唯一、FAA（米連邦航空局）のエアショーライセンス最高位の無制限クラスを保有するパイロット、内海昌浩が率いる競技曲技飛行チームです。
            </Typography>
            <Typography variant="body" className="text-gray-400">
              空飛ぶ楽しさを伝え空の仲間を増やしたいとの想いから、岡山県の岡南飛行場をベースに全国で飛行競技活動、展示飛行（エアショー）、安全講習、選手育成を行っています。
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {user ? (
              <Link to="/mission">
                <Button variant="brand" size="lg">
                  ミッションダッシュボードへ
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="brand" size="lg">
                  ログインして始める
                </Button>
              </Link>
            )}
            <Link to="/about">
              <Button variant="secondary" size="lg" className="border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10">
                チームについて
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-whiskyPapa-yellow/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-whiskyPapa-yellow rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-brand-secondary-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Typography variant="h1" color="brand" className="mb-4">
              活動の柱
            </Typography>
            <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto">
              年間約10か所のエアショーに参加し、訓練を含め年100回以上の曲技飛行を行い、年々曲技飛行のファンを増やし続けています。
            </Typography>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
            {[
              {
                icon: Award,
                title: '競技活動',
                description: 'IAC（International Aerobatic Club）主催の競技会やFAI（国際航空連盟）主催の世界選手権に向けた曲技飛行の訓練と競技参加',
              },
              {
                icon: Plane,
                title: '展示飛行',
                description: 'エアショーやイベントでの展示飛行（エアロバティック）。全国の空港で行われている航空祭、各種イベントにて実施',
              },
              {
                icon: Shield,
                title: '安全講習・育成',
                description: '安全講習、選手育成プログラム。世界選手権に代表選手をコンスタントに日本から送り込むことを目指しています',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="w-8 h-8 text-brand-primary" />
                      <CardTitle>
                        <Typography variant="h3" color="brand" as="span">
                          {item.title}
                        </Typography>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body" className="text-gray-300">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wingman Program Section */}
      <section className="py-20 bg-brand-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Typography variant="h1" color="brand" className="mb-4">
              WINGMAN PROGRAM
            </Typography>
            <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto">
              観客から僚機（Wingman）へ。ログインすると、ブログ、フライトプランニング、CPLクイズを「ミッション」として進め、ランクアップしながらパイロットの知識とスキルを身につけることができます。
            </Typography>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'SEE',
                subtitle: 'Hero / Gallery',
                description: '圧倒的な映像美で「空への憧れ」を作る',
              },
              {
                title: 'KNOW',
                subtitle: 'Mission / Planning',
                description: 'フライトプランナーやクイズを「ミッション」として提供',
              },
              {
                title: 'FLY',
                subtitle: 'Experience',
                description: 'ランクを上げたユーザーだけが限定アクセス権を得る',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors">
                  <CardHeader>
                    <CardTitle>
                      <Typography variant="h3" color="brand" as="span">
                        {item.title}
                      </Typography>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="caption" color="muted" className="mb-4">
                      {item.subtitle}
                    </Typography>
                    <Typography variant="body" className="text-gray-300">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 bg-brand-secondary-light">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Typography variant="h2" color="brand" className="mb-4">
              支援企業・団体
            </Typography>
            <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto mb-6">
              私たちの活動は、多くの企業・団体の皆様にご支援いただいています。
            </Typography>
            <Link to="/links" className="text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 underline text-sm">
              詳細はリンク集ページをご覧ください →
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Guinand',
                description: 'パイロットのために作る時計「飛ぶ為の時計」',
              },
              {
                name: '株式会社ジャプコン',
                description: 'ビジネス機の導入・受託運航・整備・空輸',
              },
              {
                name: '岡山航空株式会社',
                description: 'パイロットの操縦訓練、宣伝飛行、航空写真撮影',
              },
            ].map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardContent>
                    <Typography variant="h4" color="brand" className="mb-2">
                      {sponsor.name}
                    </Typography>
                    <Typography variant="body-sm" className="text-gray-300">
                      {sponsor.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Hook Section - Only shown when not logged in */}
      {!user && (
        <section className="py-20 bg-brand-secondary">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <Typography variant="h2" color="brand" className="mb-4">
                ログインで解放される機能
              </Typography>
              <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto">
                ログインすると、以下の機能が利用可能になります。レベルアップしながら、パイロットの知識とスキルを身につけましょう。
              </Typography>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
              {[
                {
                  icon: BookOpen,
                  title: 'ブログ',
                  description: 'チームからの最新情報とパイロット・ナレーターによる記事',
                },
                {
                  icon: Plane,
                  title: 'フライトプランニング',
                  description: '実践的なフライトプラン作成ツール',
                },
                {
                  icon: Target,
                  title: 'CPLクイズ',
                  description: '航空知識をテスト形式で学習',
                },
                {
                  icon: TrendingUp,
                  title: 'ランクアップ',
                  description: 'ミッション達成でランクを上げ、限定コンテンツへアクセス',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <feature.icon className="w-6 h-6 text-brand-primary" />
                        <CardTitle>
                          <Typography variant="h4" color="brand" as="span">
                            {feature.title}
                          </Typography>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Typography variant="body-sm" className="text-gray-300">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <Link to="/auth">
                <Button variant="brand" size="lg">
                  今すぐログイン
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section - Only shown when logged in */}
      {user && (
        <section className="py-20 bg-brand-secondary">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Typography variant="h2" color="brand">
                ミッションダッシュボードへ
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 max-w-2xl mx-auto"
            >
              <Typography variant="body" className="text-gray-300">
                ミッションをクリアしてランクを上げ、限定コンテンツへのアクセス権を獲得しましょう
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/mission">
                <Button variant="brand" size="lg">
                  ミッションダッシュボードへ
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

