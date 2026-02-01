import { motion } from 'framer-motion';
// BadgeCheck, ExternalLink はパイロット紹介・THE CREW セクションで使用（現状コメントアウト済み）
import { AlertTriangle, Gift, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

/**
 * About
 * WhiskyPapaファンサイトのAboutページ
 * パイロット紹介（Hero）・メンバー紹介（THE CREW）はコメントアウト済み（許可取得後に復活可能）
 */
const About: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/*
        Hero: The Pilot's Portrait（パイロット紹介）
        ファンサイトのため、ご本人の許可が得られるまではパイロット紹介は非表示とします。
        許可取得後はこのコメントを外して有効化してください。
      */}
      {/*
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/ContentImages/topgun2.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-whiskyPapa-black via-whiskyPapa-black/80 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-12 gap-4 lg:gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-7 lg:col-span-6"
            >
              <div className="flex items-center gap-2 mb-4 text-whiskyPapa-yellow">
                <BadgeCheck className="w-6 h-6" />
                <span className="font-bold tracking-widest uppercase">The Chief Pilot</span>
              </div>
              <Typography variant="display" className="mb-6 leading-tight">
                内海 昌浩
                <br />
                <span className="text-whiskyPapa-yellow">
                  "MASA"
                </span>
              </Typography>
              <Typography variant="h3" className="mb-8 font-light italic text-gray-300">
                "空の仲間になろう！"
              </Typography>
              <div className="prose prose-invert prose-lg text-gray-400">
                <p>
                  日本人初、そして唯一のFAA（米連邦航空局）エアショーライセンス最高位「Unlimited」クラス保持者。
                  <br />
                  エアロバティックパイロットとしての規律と情熱を併せ持つ。
                  <br />
                  その操縦桿さばきは「空に絵を描く」と評される。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-5 lg:col-span-6 flex items-center justify-center md:justify-start"
            >
              <a
                href="https://twitter.com/ja14wp"
                target="_blank"
                rel="noopener noreferrer"
                className="block group/image w-full max-w-sm relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-whiskyPapa-yellow/20 via-whiskyPapa-yellow/10 to-transparent blur-xl group-hover/image:blur-2xl transition-all duration-300 scale-110" />
                <div className="relative aspect-square w-full rounded-full overflow-hidden border-2 border-white/10 group-hover/image:border-whiskyPapa-yellow/50 transition-colors bg-gray-800 shadow-[0_0_30px_rgba(255,215,0,0.3)] group-hover/image:shadow-[0_0_40px_rgba(255,215,0,0.5)]">
                  <img
                    src="/images/ContentImages/About/masa.jpg"
                    alt="内海昌浩 MASA"
                    className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center pointer-events-none rounded-full">
                    <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
                  </div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>
      */}

      {/*
        THE CREW セクション（メンバー紹介）
        将来的に復活させる場合は、このコメントを外して有効化してください。
        元のコードはAboutWhiskyPapa.tsxを参照してください。
      */}
      {/*
      <section className="py-20 bg-whiskyPapa-black-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Typography variant="h2" className="mb-4">
              THE CREW
            </Typography>
            <p className="text-gray-400">チームを支えるプロフェッショナル。</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: 'Narrator',
                name: 'Jun',
                icon: Mic,
                desc: '空の物語を紡ぐチームの声。エアショーのナレーションを担い、エアロバティックの魅力を言葉で伝える。',
                image: '/images/ContentImages/About/jun.jpg',
                twitterUrl: 'https://twitter.com/JMASU24',
              },
              {
                role: 'Photographer & PR Manager',
                name: 'Ogane',
                icon: Camera,
                desc: '一瞬の奇跡を切り取るチームの目。GALLERYの監修を担い、エアロバティックの魅力を写真と文字で伝える。',
                image: '/images/ContentImages/About/ohgane.jpg',
                twitterUrl: 'https://twitter.com/Ayumi_Bluebase',
              },
              {
                role: 'Quarter & Designer',
                name: 'おしゅ士長',
                icon: ShoppingBag,
                desc: 'チームの装備を支える補給係。ランクに応じた特別なグッズや限定アイテムの開発・デザインを担う。',
                image: '/images/ContentImages/About/osyu.jpg',
                twitterUrl: 'https://twitter.com/jieitaiotaku',
              },
              {
                role: 'Developer',
                name: 'しゃどー',
                icon: Code,
                desc: 'デジタルの世界でコミュニティ基盤を支える技術者。公式Webページの開発・管理を担う。',
                image: '/images/ContentImages/About/shadow.jpg',
                twitterUrl: 'https://twitter.com/ChatterMiracle',
              },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-whiskyPapa-black border border-white/10 p-8 rounded-xl hover:border-whiskyPapa-yellow/50 transition-colors group"
              >
                {member.image && member.twitterUrl && (
                  <a
                    href={member.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-6 group/image"
                  >
                    <div className="relative aspect-square w-full rounded-full overflow-hidden border-2 border-white/10 group-hover/image:border-whiskyPapa-yellow/50 transition-colors bg-gray-800">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center pointer-events-none rounded-full">
                        <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </a>
                )}
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-whiskyPapa-yellow group-hover:text-black transition-colors">
                  <member.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-whiskyPapa-yellow mb-2 uppercase tracking-wider">{member.role}</div>
                <h3 className="text-2xl font-bold mb-4">{member.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      */}

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
              <Link to="/mission?tab=blog">
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
