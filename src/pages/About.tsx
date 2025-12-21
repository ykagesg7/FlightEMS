import React from 'react';
import { motion } from 'framer-motion';

/**
 * About Page
 * Team & Extra300L Spec
 * メンバー紹介と機体スペック（パララックス効果）
 */
const About: React.FC = () => {
  const teamMembers = [
    {
      role: 'Pilot',
      name: 'Masa (内海昌浩)',
      title: 'Master Instructor',
      description: 'ミッションの総監修。トップメッセージ。',
    },
    {
      role: 'Narrator',
      name: 'Jun (ナレーター)',
      title: 'Briefing Officer',
      description: 'ミッション通達、ブログ（脚本風）、体験搭乗時のナレーション。',
    },
    {
      role: 'Photographer',
      name: 'Ohgane (PR)',
      title: 'Visual Director',
      description: '公式ギャラリー（パララックス演出）。ファンの投稿写真の選定（Award）。',
    },
    {
      role: 'Shop',
      name: 'Osu (おす士長)',
      title: 'Quartermaster (補給係)',
      description: 'PX（売店）の管理。ランク限定グッズ（ワッペン等）の提供。',
    },
  ];

  const aircraftSpecs = [
    { label: '機種', value: 'Extra 300L' },
    { label: '全長', value: '6.96m' },
    { label: '全幅', value: '8.00m' },
    { label: '全高', value: '2.62m' },
    { label: '最高速度', value: '440km/h' },
    { label: 'エンジン', value: 'Lycoming AEIO-540-L1B5' },
    { label: '最高出力', value: '300馬力' },
  ];

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-whiskyPapa-black to-whiskyPapa-black-dark">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-whiskyPapa-yellow"
          >
            ABOUT WHISKY PAPA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            ウイスキーパパ競技曲技飛行チームは、世界選手権日本代表チームが母体となり、
            日本人初で唯一、FAA（米連邦航空局）のエアショーライセンス最高位の無制限クラスを保有するパイロット、
            内海昌浩が率いる競技曲技飛行チームです。
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-gray-400 max-w-3xl mx-auto"
          >
            空飛ぶ楽しさを伝え空の仲間を増やしたいとの想いから、岡山県の岡南飛行場をベースに全国で
            飛行競技活動、展示飛行（エアショー）、安全講習、選手育成を行っています。
          </motion.p>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-whiskyPapa-black-light">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 text-whiskyPapa-yellow"
          >
            チーム沿革
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-invert max-w-none"
            >
              <p className="text-gray-300 text-lg mb-6">
                もっと曲技飛行競技を知って貰うために、そして、日本代表として世界選手権に出る日本人パイロットを育成するために
              </p>
              <p className="text-gray-300 mb-6">
                ウイスキーパパ競技曲技飛行チームは、日本国内ではほとんど知られていない曲技飛行競技を一般の人に広く知って貰うことと競技者の育成を目的に、展示飛行（エアショー）・講習・コーチング・訓練を行うために、2008年に開催された曲技飛行競技世界選手権（Advanced World Aerobatic Championship）の日本代表チームが母体となり、内海昌浩によって結成されました。
              </p>
              <p className="text-gray-300 mb-6">
                国内では2009年8月にエクストラ式EA-300L型（JA14WP）の運用を開始し、FAI（国際航空連盟）及びIAC（International Aerobatic Club）主催の競技会に向けた曲技飛行の訓練やイベント、航空祭などで展示飛行を行っています。
              </p>
              <p className="text-gray-300">
                年間約10か所のエアショーに参加し、訓練を含め年100回以上の曲技飛行を行い、年々曲技飛行のファンを増やし続けています。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Aerobatics Section */}
      <section className="py-20 bg-whiskyPapa-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 text-whiskyPapa-yellow"
          >
            曲技飛行競技とは
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="prose prose-invert max-w-none"
            >
              <p className="text-gray-300 mb-6">
                曲技飛行の競技は、宙返りなどの曲技飛行科目（フィギュア）の正確さと美しさを競い合って行われます。選手は10から15のフィギュアからなる、決められた一連の演技（シークエンス）を空中に設定された1辺が1kmの立方体の演技空域（BOX）の中で飛び、5～7組の審判団がそれを採点します。
              </p>
              <p className="text-gray-300 mb-6">
                審判はシークエンスの中で実施された各フィギュアをそれぞれ10点満点で採点していきます。採点には厳密な基準があり、あるべき角度から5度ずれるごとに0.5点減点するなど細かく決まっていて、10点満点から減点法で採点されます。このフィギュアの採点にフィギュアの難易度（K）を掛けた値がそのフィギュアでの得点となり、シークエンスの各フィギュアの得点の合計点数に、全体の印象で加算される印象点を加え、演技空域（BOX）からの逸脱や下限高度の違反、中断などによるペナルティーの減点を行い、総合得点を決定します。
              </p>
              <p className="text-gray-300 mb-6">
                競技クラスは、Primary, Sportsman, Intermediate, Advanced, Unlimitedの5クラスがあり、自分の技術と機体の性能に合わせて参加します。Unlimited以外には特別な参加資格はありませんが、通常は安全のためにも下のクラスから徐々にステップアップします。
              </p>
              <p className="text-gray-300">
                曲技飛行は通常飛行の延長で特別なものではありません。特別視される曲技飛行ですが、旋回を縦にすればループになり、空力と機体の挙動を理解すれば、知識と技術の水準は多少上がるにせよ、通常の飛行と曲技飛行の安全性に違いはありません。民間での曲技飛行は、ともすれば危険・無謀と見なされがちですが、訓練を積み、安全に行えるものだけをエアショーで実施しています。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-whiskyPapa-black-light">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 text-whiskyPapa-yellow"
          >
            TEAM MEMBERS
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 border border-whiskyPapa-yellow/30 rounded-lg hover:border-whiskyPapa-yellow/60 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-whiskyPapa-yellow/20 rounded-full flex items-center justify-center text-whiskyPapa-yellow font-bold">
                    {member.role[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-whiskyPapa-yellow mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{member.title}</p>
                    <p className="text-gray-300">{member.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Aircraft Spec Section */}
      <section className="py-20 bg-whiskyPapa-black">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-center mb-12 text-whiskyPapa-yellow"
          >
            EXTRA 300L SPECIFICATIONS
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-gray-300 prose prose-invert max-w-none"
            >
              <p className="mb-4">
                チームは、曲技飛行専用機エクストラEA-300L 1機を使用。本機は曲技飛行士でもあったウォルター・エクストラが1988年に開発した2人乗りの曲技飛行専用機で、カーボン製の強靭な翼と鋼管フレームの頑丈な胴体からなり、+/-10Gの荷重に耐えられる。
              </p>
              <p className="mb-4">
                特徴は、背面飛行時でも通常飛行と同様の揚力を発生させるために対称翼であること。また、一般的に翼は機体に対してやや上向きに取付けられていることが多いが、この機体の主翼の取付角は機体の前後を結ぶ線（Longitudinal Axis）と平行に取付けられている。これは、背面飛行時の飛行性能を担保するためのもの。
              </p>
              <p>
                コックピットには速度計、高度計、エンジンと燃料計器以外は一切装備されておらず、マグネチックコンパスが唯一の航法計器。AI（姿勢指示器）やHSI（水平位置指示計）、GPS、VORもなく、パイロット曰く「地球が計器」。常に地表を目視し飛行する。
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-6 p-8 border border-whiskyPapa-yellow/30 rounded-lg"
            >
              {aircraftSpecs.map((spec, index) => (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex justify-between items-center p-4 bg-whiskyPapa-black-light rounded"
                >
                  <span className="text-gray-400">{spec.label}</span>
                  <span className="text-whiskyPapa-yellow font-bold">{spec.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

