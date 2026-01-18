import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Lock, PlayCircle, Target, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, Typography } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

/**
 * Home
 * WhiskyPapaファンサイトのホームページ
 */
const Home: React.FC = () => {
  const { user } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="relative min-h-screen bg-whiskyPapa-black text-white overflow-hidden">
      {/* Hero Section: Immersion */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background - Pilot's View from Cockpit */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-whiskyPapa-black via-whiskyPapa-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('/images/ContentImages/Home/wp_cockpit_view.jpg')] bg-cover bg-center opacity-40 scale-105" />
        </div>

        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            <h2 className="text-whiskyPapa-yellow tracking-[0.2em] text-sm md:text-base font-bold mb-4 uppercase">
              Competition Aerobatic Team
            </h2>
            <Typography variant="display" className="mb-2 !text-6xl md:!text-8xl font-black italic tracking-tighter">
              Sync with
            </Typography>
            <Typography variant="display" color="brand" className="mb-8 !text-6xl md:!text-8xl font-black italic tracking-tighter">
              WHISKY PAPA
            </Typography>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed"
          >
            空は自由で美しい。
            <br className="md:hidden" />

            <br />
            空の仲間になろう。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {user ? (
              <Link to="/mission">
                <Button variant="brand" size="lg" className="px-8 py-6 text-lg min-w-[240px]">
                  <Target className="mr-2 h-5 w-5" />
                  Start MISSION
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="brand" size="lg" className="px-8 py-6 text-lg min-w-[240px] shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                  JOIN our Formation
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/gallery">
              <Button variant="secondary" size="lg" className="px-8 py-6 text-lg min-w-[240px] border-white/20 hover:bg-white/10 text-white">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch GALLERY
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Concept: The Narrative */}
      <section className="py-24 bg-whiskyPapa-black relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={itemVariants} className="relative">
              {/* Background - Cockpit Instrument Panel (only for text section) */}
              <div className="absolute inset-0 z-0 md:rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-whiskyPapa-black/70 via-whiskyPapa-black/60 to-whiskyPapa-black/70 z-10" />
                <div className="absolute inset-0 bg-[url('/images/ContentImages/Home/wp_cockpit_instruments.jpg')] bg-cover bg-center opacity-60" />
              </div>
              <div className="relative z-10 p-8 md:p-12">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 text-[120px] font-black text-whiskyPapa-yellow/5 select-none z-0">
                    WHY
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
                    その熱狂には
                    <br />
                    <span className="text-whiskyPapa-yellow">
                      LOGIC
                      <br />
                    </span>
                    がある。
                  </h2>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  アクロバット飛行は、単なるショーではありません。
                  <br />
                  気象、航空力学、生理学、そして緻密な計画。
                  <br />
                  膨大な知識と準備の先にある「完璧の美しさ」です。
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Whisky Papaは、その「裏側のコクピットの思考」まで公開します。
                  <br />
                  見るだけのファンから、ともに飛ぶ「ウイングマン」へ。
                </p>
                <Link to="/about">
                  <span className="inline-flex items-center text-whiskyPapa-yellow hover:text-white transition-colors font-bold border-b border-whiskyPapa-yellow pb-1">
                    READ our Philosophy <ChevronRight className="ml-1 w-4 h-4" />
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="h-48 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src="/images/ContentImages/Home/wp_planning.avif"
                    alt="Planning"
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="h-64 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src="/images/ContentImages/Home/wp_cockpit.jfif"
                    alt="Cockpit"
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src="/images/ContentImages/Home/wp_aerobatics.avif"
                    alt="Aerobatics"
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="h-48 bg-gray-800 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src="/images/ContentImages/Home/wp_team.jfif"
                    alt="Team"
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Wingman Program (Roadmap) */}
      <section className="py-24 bg-gradient-to-b from-whiskyPapa-black-light to-whiskyPapa-black border-t border-white/5 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-whiskyPapa-black/75 via-whiskyPapa-black/65 to-whiskyPapa-black/75 z-10" />
          <div className="absolute inset-0 bg-[url('/images/ContentImages/Home/wp_aerobatic_flight2.jpg')] bg-cover bg-center opacity-80" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center mb-16">
            <Typography variant="h4" color="brand" className="mb-2 uppercase tracking-widest">
              Wingman Program
            </Typography>
            <h2 className="text-4xl md:text-5xl font-bold text-white">空へのキャリアパス</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-700 via-whiskyPapa-yellow to-gray-700 z-0" />

            {[
              {
                step: '01',
                role: 'Fan',
                desc: 'まずは「観る」ことから。',
                features: ['Galleryの閲覧・投稿', 'Shopの利用', 'Blogの閲覧'],
                icon: Users,
                active: true,
              },
              {
                step: '02',
                role: 'Trainee',
                desc: 'パイロットの知識を学ぶ。',
                features: ['学科試験への挑戦', 'Flight Plannerの利用', 'XP（経験値）の獲得'],
                icon: BookOpen,
                active: !!user,
              },
              {
                step: '03',
                role: 'Wingman',
                desc: '空の仲間として認められる。',
                features: ['体験搭乗権', '限定グッズ購入', 'Briefingへの参加'],
                icon: Trophy,
                active: false,
              },
            ].map((rank, i) => (
              <motion.div
                key={rank.role}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10"
              >
                <Card
                  variant="brand"
                  padding="none"
                  className="h-full border border-white/20 bg-whiskyPapa-black-light/60 backdrop-blur-sm p-8 hover:border-whiskyPapa-yellow/50 hover:bg-whiskyPapa-black-light/70 transition-all group"
                >
                  <CardContent className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 text-2xl font-bold bg-gray-800 text-gray-500 group-hover:bg-whiskyPapa-yellow group-hover:text-black transition-colors">
                      {React.createElement(rank.icon, { className: 'w-8 h-8' })}
                    </div>
                    <div className="text-sm font-mono text-gray-500 mb-2">STEP {rank.step}</div>
                    <h3 className={`text-2xl font-bold mb-4 ${rank.active ? 'text-white' : 'text-gray-500'}`}>{rank.role}</h3>
                    <p className="text-gray-400 mb-6 min-h-[3em]">{rank.desc}</p>
                    <ul className="text-left space-y-3 bg-black/20 p-4 rounded-lg">
                      {rank.features.map((f: string, j: number) => (
                        <li key={j} className="flex items-center text-sm text-gray-300">
                          {rank.role === 'Wingman' ? (
                            <Lock className="w-3 h-3 mr-2 text-whiskyPapa-yellow" />
                          ) : (
                            <ChevronRight className="w-3 h-3 mr-2 text-whiskyPapa-yellow" />
                          )}
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to Mission Blog */}
      <section className="py-20 bg-whiskyPapa-black text-center border-t border-white/10 relative overflow-hidden">
        {/* Background - Aerobatic Flight */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-whiskyPapa-black/70 via-whiskyPapa-black/60 to-whiskyPapa-black/70 z-10" />
          <div className="absolute inset-0 bg-[url('/images/ContentImages/Home/wp_aerobatic_flight.jpg')] bg-cover bg-center opacity-45" />
        </div>
        <div className="container mx-auto px-4 relative z-20">
          <Typography variant="h3" className="mb-4 text-whiskyPapa-yellow">
            THE PILOT&apos;S NARRATIVE
          </Typography>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            沿革、競技の仕組み、機体説明。会員向けブログで公開中。
            <br />
            さあ、コクピットを覗きに行こう。
          </p>
          <Link to="/mission?tab=blog">
            <Button variant="brand" size="lg" className="px-8 py-4 text-lg">
              JOIN our Formation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
