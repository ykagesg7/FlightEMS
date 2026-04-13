import { motion } from 'framer-motion';
import { AlertTriangle, Gift, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

/** About — プラットフォーム紹介（機体スペック・利用上の注意） */
const About: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* The Machine: HUD Style Specs */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 md:py-32 overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center"
      >
        {/* 背景画像 */}
        <div className="absolute inset-0">
          <img
            src="/images/ContentImages/About/extra300.jpg"
            alt="EXTRA 300L"
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* ダークオーバーレイ（可読性確保） */}
          <div className="absolute inset-0 bg-black/50 md:bg-black/40" />
          {/* グリッド背景 */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* コンテンツ */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            {/* セクションタイトル */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Typography variant="h1" className="mb-4">
                AIRCRAFT
              </Typography>
            </motion.div>
            {/* 機体名タイトル */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <Typography
                variant="display"
                className="text-4xl md:text-6xl font-mono text-[#39FF14]"
                style={{
                  textShadow: '0 0 10px rgba(57, 255, 20, 0.5), 0 0 20px rgba(57, 255, 20, 0.3)',
                }}
              >
                EXTRA 300L
              </Typography>
            </motion.div>

            {/* 説明文 */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[#39FF14]/90 mb-8 md:mb-12 max-w-2xl text-sm md:text-base leading-relaxed"
              style={{
                textShadow: '0 0 4px rgba(57, 255, 20, 0.3)',
              }}
            >
              ドイツのエクストラ社が開発した、世界最高峰の曲技飛行専用機。
              <br className="hidden md:block" />
              カーボン複合材の主翼と鋼管フレームにより、+/-10Gの過酷な荷重に耐える。
            </motion.p>

            {/* スペック情報 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 font-mono"
            >
              {[
                { label: 'ENGINE', val: 'Lycoming AEIO-540' },
                { label: 'POWER', val: '300 HP' },
                { label: 'Vne (Max Speed)', val: '220 kts (407 km/h)' },
                { label: 'G-LOAD', val: '+/- 10G' },
                { label: 'ROLL RATE', val: '400 deg/sec' },
                { label: 'SEATS', val: '2 (Tandem)' },
              ].map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="border-b border-[#39FF14]/20 pb-3"
                >
                  <div className="text-[#39FF14]/70 text-xs md:text-sm mb-1 uppercase tracking-wider font-semibold">
                    {spec.label}
                  </div>
                  <div
                    className="text-[#39FF14] text-lg md:text-xl font-semibold"
                    style={{
                      textShadow: '0 0 8px rgba(57, 255, 20, 0.4), 0 0 4px rgba(57, 255, 20, 0.2)',
                    }}
                  >
                    {spec.val}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* MISSION BRIEF - サイト説明・メリット・注意事項 */}
      <section className="py-20 bg-whiskyPapa-black-light border-t border-white/10">
        <div className="container mx-auto px-4">
          {/* セクションタイトルとサイト説明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="mb-4">
              MISSION BRIEF
            </Typography>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
              このサイトは、エアロバティックチーム WhiskyPapa を応援する
              <span className="text-whiskyPapa-yellow font-semibold">非公式ファンサイト</span>です。
              <br />
              エアロバティックの魅力を発信し、空の仕事を目指す「空の仲間」を後押しします。
            </p>
          </motion.div>

          {/* 利用メリット - 3カードレイアウト */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Gift,
                title: '無料の学習ツール',
                desc: '自家用・事業用操縦士の学科試験対策クイズや飛行計画アプリを無料で提供。空の仕事を目指すあなたをサポートします。',
              },
              {
                icon: Users,
                title: 'ファンコミュニティ',
                desc: 'WhiskyPapaやエアロバティックを愛する仲間と交流できる場所。情報交換や応援の輪を広げましょう。',
              },
              {
                icon: Trophy,
                title: 'ランクシステム',
                desc: '学習を続けるとランクアップ！ゲーム感覚で楽しみながら航空知識を身につけられます。',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-whiskyPapa-black border border-white/10 p-6 rounded-xl hover:border-whiskyPapa-yellow/50 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-whiskyPapa-yellow group-hover:text-black transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 注意事項 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-900/50 border border-amber-500/20 rounded-xl p-6 mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-amber-500">ご利用にあたって</h3>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500/70 mt-1">•</span>
                <span>本サイトは<strong className="text-white">非公式のファンサイト</strong>であり、WhiskyPapa関係者様が運営するものではありません。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500/70 mt-1">•</span>
                <span>掲載情報の正確性・完全性は保証しておりません。<strong className="text-white">ご利用は自己責任</strong>でお願いいたします。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500/70 mt-1">•</span>
                <span>著作権・肖像権に配慮し、問題がある場合は速やかに対応いたします。</span>
              </li>
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            {user ? (
              <Link to="/articles">
                <Button variant="brand" size="lg" className="px-6 py-3">
                  JOIN our Formation
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="brand" size="lg" className="px-6 py-3">
                  JOIN our Formation
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
