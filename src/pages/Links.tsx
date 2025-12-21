import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { ExternalLink, Mail, Twitter, Youtube, Instagram, Globe } from 'lucide-react';

/**
 * Links Page
 * 公式サイト、SNS、スポンサー、問い合わせなどのリンク集
 * 未ログインでも閲覧可能
 */
const Links: React.FC = () => {
  const officialLinks = [
    {
      name: '公式サイト（Wix）',
      url: 'https://ja14wp.wixsite.com/home',
      description: 'ウイスキーパパ競技曲技飛行チーム公式ウェブサイト',
    },
    {
      name: 'About',
      url: 'https://ja14wp.wixsite.com/home/about',
      description: 'チームについて',
    },
    {
      name: 'Aerobatics',
      url: 'https://ja14wp.wixsite.com/home/aerobatics',
      description: '曲技飛行競技について',
    },
    {
      name: 'Airshows',
      url: 'https://ja14wp.wixsite.com/home/airshows',
      description: 'エアショー情報',
    },
    {
      name: 'Gallery',
      url: 'https://ja14wp.wixsite.com/home/gallery',
      description: 'ギャラリー',
    },
    {
      name: 'Sponsors',
      url: 'https://ja14wp.wixsite.com/home/sponsors',
      description: 'スポンサー情報',
    },
  ];

  const socialLinks = [
    {
      name: 'Twitter / X',
      url: 'https://twitter.com/ja14wp?lang=ja',
      icon: Twitter,
      description: '参加予定のエアショーやイベント情報、活動詳細等の最新情報',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/channel/UCMix8_VmokzvDaWZ4w4Lfjg',
      icon: Youtube,
      description: 'エアショーの動画や練習風景',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ja14wp/',
      icon: Instagram,
      description: '写真や最新情報',
    },
  ];

  const sponsorLinks = [
    {
      name: 'Guinand',
      url: 'http://www.guinand-watch.jp/',
      description: 'Guinand（ギナーン）は、第二次大戦をドイツ軍パイロットとして飛んだHelmut Sinnが、パイロットのために作る時計です。パイロットが求める機能に真摯に向き合った「飛ぶ為の時計」です',
    },
    {
      name: '株式会社ジャプコン',
      url: 'https://www.japcon.co.jp/',
      description: 'ビジネス機の導入・受託運航・整備・空輸をされています。日本のジェネラル・アビエーションの普及と発展に尽力されています。',
    },
    {
      name: '岡山航空株式会社',
      url: 'https://www.air-oas.co.jp/',
      description: 'パイロットの操縦訓練、宣伝飛行、航空写真撮影、航空機の受託整備、修理改造等の業務を行っています。',
    },
  ];

  const contactLinks = [
    {
      name: 'メールでのお問い合わせ',
      url: 'mailto:ja14wp@gmail.com?subject=ウイスキーパパお問い合わせ',
      icon: Mail,
      description: 'ja14wp@gmail.com',
    },
    {
      name: 'オルト商会',
      url: 'tel:0877-33-3373',
      icon: Mail,
      description: '0877-33-3373（担当：内海）',
    },
  ];

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Typography variant="display" color="brand" className="mb-4">
            LINKS
          </Typography>
          <Typography variant="h3" className="text-gray-300">
            リンク集
          </Typography>
        </motion.div>

        {/* Official Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Typography variant="h2" color="brand" className="mb-6 flex items-center gap-3">
            <Globe className="w-8 h-8" />
            Official
          </Typography>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="block"
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <Typography variant="h4" color="brand" as="span">
                        {link.name}
                      </Typography>
                      <ExternalLink className="w-4 h-4 text-brand-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body-sm" className="text-gray-300">
                      {link.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Typography variant="h2" color="brand" className="mb-6 flex items-center gap-3">
            <Twitter className="w-8 h-8" />
            SNS
          </Typography>
          <div className="grid md:grid-cols-3 gap-6">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="block"
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <link.icon className="w-6 h-6 text-brand-primary" />
                        <Typography variant="h4" color="brand" as="span">
                          {link.name}
                        </Typography>
                      </div>
                      <ExternalLink className="w-4 h-4 text-brand-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body-sm" className="text-gray-300">
                      {link.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Sponsor Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Typography variant="h2" color="brand" className="mb-6">
            Sponsors
          </Typography>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {sponsorLinks.map((sponsor, index) => (
              <motion.a
                key={sponsor.name}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="block"
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <Typography variant="h4" color="brand" as="span">
                        {sponsor.name}
                      </Typography>
                      <ExternalLink className="w-4 h-4 text-brand-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body-sm" className="text-gray-300">
                      {sponsor.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-whiskyPapa-black-dark border border-whiskyPapa-yellow/30 rounded-lg p-6"
          >
            <Typography variant="h3" color="brand" className="mb-4">
              スポンサー募集
            </Typography>
            <Typography variant="body" className="text-gray-300 mb-4">
              私たちは、エアショーやイベントでの機体展示を通じて、曲技飛行という航空スポーツのみでなく、空と飛行機を身近に感じて貰おうと活動しております。
            </Typography>
            <Typography variant="body" className="text-gray-300 mb-4">
              子供達が空を、ただ見上げるだけでなく、飛ぶことを夢見てくれるようになってくれることが私たちの願いです。ホームベースの岡南飛行場はもちろん、全国の空港で行われている航空祭、また各種イベントにて曲技飛行（アクロバット）、展示飛行を実施いたします。
            </Typography>
            <Typography variant="body" className="text-gray-300">
              実際に飛行する曲技飛行専用機に広告掲載することにより、貴社イメージアップに効果絶大です。各空港やイベントで将来のパイロットや整備士を目指す子供達に大きな夢を与えます。
            </Typography>
            <div className="mt-6">
              <Typography variant="body-sm" className="text-gray-400 mb-2">
                広告、スポンサー、協賛のお問い合わせは：
              </Typography>
              <a
                href="https://www.japcon.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-whiskyPapa-yellow hover:text-whiskyPapa-yellow/80 underline"
              >
                株式会社ジャプコン
              </a>
              <Typography variant="body-sm" className="text-gray-400 mt-2">
                または オルト商会 0877-33-3373（担当：内海）までお願いします
              </Typography>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Typography variant="h2" color="brand" className="mb-6 flex items-center gap-3">
            <Mail className="w-8 h-8" />
            Contact
          </Typography>
          <div className="grid md:grid-cols-2 gap-6">
            {contactLinks.map((contact, index) => (
              <motion.a
                key={contact.name}
                href={contact.url}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="block"
              >
                <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <contact.icon className="w-6 h-6 text-brand-primary" />
                      <Typography variant="h4" color="brand" as="span">
                        {contact.name}
                      </Typography>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="body-sm" className="text-gray-300">
                      {contact.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Links;

