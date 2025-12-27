import { motion } from 'framer-motion';
import { BadgeCheck, Camera, Code, ExternalLink, Mic, ShoppingBag } from 'lucide-react';
import React from 'react';
import { Typography } from '../components/ui';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* Hero: The Pilot's Portrait */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/ContentImages/topgun2.jpg')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-whiskyPapa-black via-whiskyPapa-black/80 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-12 gap-4 lg:gap-6 items-center">
            {/* テキストを左側に配置 */}
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

            {/* 画像を右側に配置 - 丸いフレーム + グロー効果 */}
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
                {/* 外側のグローリング効果（丸形） */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-whiskyPapa-yellow/20 via-whiskyPapa-yellow/10 to-transparent blur-xl group-hover/image:blur-2xl transition-all duration-300 scale-110" />
                {/* 丸いフレーム - 特別感を演出するグロー効果付き */}
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

      {/* The Crew: Role Cards */}
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
                          // 画像が読み込めない場合はアイコンを表示
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

      {/* The Machine: HUD Style Specs */}
      <section className="py-24 bg-whiskyPapa-black relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono mb-6">
                SYSTEM: ACTIVE
              </div>
              <Typography variant="display" className="mb-2 text-5xl font-mono">
                EXTRA 300L
              </Typography>
              <p className="text-gray-400 mb-8 max-w-md">
                ドイツのエクストラ社が開発した、世界最高峰の曲技飛行専用機。
                カーボン複合材の主翼と鋼管フレームにより、+/-10Gの過酷な荷重に耐える。
              </p>

              <div className="grid grid-cols-2 gap-4 font-mono text-sm">
                {[
                  { label: 'ENGINE', val: 'Lycoming AEIO-540' },
                  { label: 'POWER', val: '300 HP' },
                  { label: 'Vne (Max Speed)', val: '220 kts (407 km/h)' },
                  { label: 'G-LOAD', val: '+/- 10G' },
                  { label: 'ROLL RATE', val: '400 deg/sec' },
                  { label: 'SEATS', val: '2 (Tandem)' },
                ].map((spec) => (
                  <div key={spec.label} className="border-b border-white/10 pb-2">
                    <div className="text-gray-500 text-xs">{spec.label}</div>
                    <div className="text-white text-lg">{spec.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/3] bg-gradient-to-tr from-green-900/20 to-transparent border border-green-500/20 rounded-lg overflow-hidden relative">
                {/* 画像を背景として表示 */}
                <img
                  src="/images/ContentImages/About/extra300.jpg"
                  alt="EXTRA 300L"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    // 画像が読み込めない場合はフォールバック表示
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {/* オーバーレイ: グラデーションとHUDスタイルの情報 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
                <div className="absolute top-4 right-4 text-green-500/50 font-mono text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                  STATUS: READY
                  <br />
                  FUEL: 100%
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Secondary info is now moved to Mission Blog */}
      <section className="py-16 bg-whiskyPapa-black text-center border-t border-white/10">
        <div className="container mx-auto px-4">
          <Typography variant="h4" className="mb-3 text-whiskyPapa-yellow">
            SKY NOTES
          </Typography>
          <p className="text-gray-300 mb-6">
            沿革・競技の仕組み・機体詳細は、会員向けブログで公開中。
            <br />
            コクピットの思考を読むならここから。
          </p>
          <a
            href="/mission?tab=blog"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-whiskyPapa-yellow text-black font-bold hover:bg-whiskyPapa-yellow/90 transition-colors"
          >
            JOIN our Formation
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;

