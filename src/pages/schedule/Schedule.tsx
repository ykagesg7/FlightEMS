import { motion } from 'framer-motion';
import { Calendar, ExternalLink, MapPin, Plane, Twitter, Youtube } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Typography } from '../../components/ui';

// プロモーション動画の設定
// 特定の動画IDを設定する場合は、YouTube動画IDを指定してください
// 例: 'dQw4w9WgXcQ' (URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
const PROMOTION_VIDEO_ID = ''; // プロモーション用動画ID（空の場合はチャンネル最新動画を表示）

// 今シーズンのスケジュールデータ（将来的にはDB/CMSから取得）
// 日程は確定次第更新されます
// 過去実績のあるイベントを紹介しています（2026年の参加は未定です）
const scheduleData: Array<{
  id: string;
  date: string | null; // nullの場合は「未定」
  location: string;
  title: string;
  description: string;
  typicalDate: string; // 例年の開催時期
  sortOrder: number; // ソート順（5月=5, 10月=10, 11月=11）
  type: 'practice' | 'event' | 'demo';
}> = [
    {
      id: '1',
      date: '2026-05-03',
      location: '岩国航空基地（山口県）',
      title: '海上自衛隊/米海兵隊 岩国航空基地フレンドシップデー',
      description: '2010年の初参加以来、毎年参加している日本最大級の航空イベント。13万人超の来場者を誇るゴールデンウィークの恒例イベントで、ウイスキーパパの曲技飛行が多くの観客を魅了しています。',
      typicalDate: '例年5月3日または5月5日前後（ゴールデンウィーク期）',
      sortOrder: 5,
      type: 'event' as const,
    },
    {
      id: '2',
      date: null,
      location: '鹿屋航空基地（鹿児島県）',
      title: 'エアーメモリアル in かのや',
      description: '海上自衛隊 鹿屋航空基地で開催される航空イベント。過去に展示飛行を実施し、観客から高い評価をいただいています。迫力ある曲技飛行で会場を盛り上げます。',
      typicalDate: '例年4月下旬〜5月上旬',
      sortOrder: 5,
      type: 'event' as const,
    },
    {
      id: '3',
      date: null,
      location: '芦屋基地（福岡県）',
      title: '航空自衛隊 芦屋基地航空祭',
      description: '航空自衛隊 芦屋基地で開催される航空祭。2018年に初参加し、以降も定期的に展示飛行を行っています。プロフェッショナルな曲技飛行でイベントを彩ります。',
      typicalDate: '例年10月中旬（10月第2〜3週の日曜日）',
      sortOrder: 10,
      type: 'event' as const,
    },
    {
      id: '4',
      date: null,
      location: '徳島航空基地（徳島県）',
      title: '海上自衛隊 徳島航空基地 航空祭',
      description: '海上自衛隊 徳島航空基地で開催される航空祭。過去に展示飛行を実施し、多くの観客に感動をお届けしています。精密な曲技飛行でイベントのクライマックスを演出します。',
      typicalDate: '例年11月中旬',
      sortOrder: 11,
      type: 'event' as const,
    },
    {
      id: '5',
      date: null,
      location: '岡南飛行場（岡山県）',
      title: '岡南飛行場まつり',
      description: '岡南飛行場で開催される航空まつり。過去に曲技飛行を実施し、地域の皆様に大変好評をいただいています。地域密着型イベントを盛り上げるパフォーマンスをお届けします。',
      typicalDate: '例年11月17日頃',
      sortOrder: 11,
      type: 'event' as const,
    },
    {
      id: '6',
      date: null,
      location: '築城基地（福岡県）',
      title: '航空自衛隊 築城基地航空祭',
      description: '航空自衛隊 築城基地で開催される航空祭。複数年にわたり参加実績のあるイベントで、過去に曲技飛行を披露しています。観客の心に残る感動的なフライトを提供します。',
      typicalDate: '例年11月下旬',
      sortOrder: 11,
      type: 'event' as const,
    },
  ];

/**
 * Schedule Page
 * 今シーズンのスケジュールを表示するページ
 */
const Schedule: React.FC = () => {
  // 例年の開催時期順にソート（sortOrderでソート、同じ場合は日付順）
  const sortedSchedule = [...scheduleData].sort((a, b) => {
    // まずsortOrderでソート
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    // sortOrderが同じ場合は日付でソート
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1; // 未定は後ろに
    if (b.date === null) return -1; // 未定は後ろに
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const formatDate = (dateString: string | null) => {
    if (dateString === null) {
      return '未定';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getTypeLabel = (type: 'practice' | 'event' | 'demo') => {
    switch (type) {
      case 'practice':
        return '練習';
      case 'event':
        return 'イベント';
      case 'demo':
        return 'デモ';
      default:
        return '';
    }
  };

  const getTypeColor = (type: 'practice' | 'event' | 'demo') => {
    switch (type) {
      case 'practice':
        return 'text-blue-400';
      case 'event':
        return 'text-whiskyPapa-yellow';
      case 'demo':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTypeBorderColor = (type: 'practice' | 'event' | 'demo') => {
    switch (type) {
      case 'practice':
        return 'border-blue-400/30';
      case 'event':
        return 'border-whiskyPapa-yellow/30';
      case 'demo':
        return 'border-green-400/30';
      default:
        return 'border-gray-400/30';
    }
  };

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
            SCHEDULE
          </Typography>
          <Typography variant="h3" className="text-gray-300 mb-2">
            過去実績のあるイベント
          </Typography>
          <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto mb-4">
            ウイスキーパパは、日本各地の航空祭・エアショーで曲技飛行を披露してきました。
            プロフェッショナルなパフォーマンスで、イベントをより魅力的に、観客に感動をお届けします。
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-2">
            2026年の参加は未定です。日程が確定次第、更新いたします。
          </Typography>
        </motion.div>

        {/* Schedule List */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sortedSchedule.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="brand" padding="md" className="border-brand-primary/30 hover:border-brand-primary/60 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Date Section */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-brand-primary" />
                      <Typography variant="h4" color="brand">
                        {formatDate(item.date)}
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(item.type)} border ${getTypeBorderColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1">
                    <CardHeader className="p-0 mb-2">
                      <CardTitle>
                        <Typography variant="h3" color="brand" as="span">
                          {item.title}
                        </Typography>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <Typography variant="body-sm" color="muted">
                          {item.location}
                        </Typography>
                      </div>
                      <div className="mb-3">
                        <Typography variant="body-sm" className="text-gray-400 italic">
                          {item.typicalDate}
                        </Typography>
                      </div>
                      <Typography variant="body" className="text-gray-300">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State (if no schedule) */}
        {sortedSchedule.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-400 mb-2">
              スケジュールがありません
            </Typography>
            <Typography variant="body" color="muted">
              今シーズンの予定はまだ確定していません。最新情報はTwitterやFacebookでお知らせします。
            </Typography>
          </motion.div>
        )}

        {/* Marketing Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <Card variant="brand" padding="lg" className="border-brand-primary/50 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <CardHeader>
              {/* #region agent log */}
              {(() => {
                fetch('http://127.0.0.1:7242/ingest/df8c824b-ad69-49a1-bdf1-acbbc4f35ebd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Schedule.tsx:263', message: 'CardTitle removed, Typography directly in CardHeader', data: { hasCardTitle: false, hasTypographyH2: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'A' }) }).catch(() => { });
                return null;
              })()}
              {/* #endregion */}
              <Typography variant="h2" color="brand" className="mb-3">
                あなたのイベントに彩りと感動を
              </Typography>
              <Typography variant="body" className="text-gray-300">
                航空祭だけではありません。見晴らしの良い場所があれば、様々なイベントで曲技飛行を披露できます。
              </Typography>
            </CardHeader>
            <CardContent>
              {/* Video Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube className="w-5 h-5 text-brand-primary" />
                  <Typography variant="h4" color="brand">
                    パフォーマンス動画
                  </Typography>
                </div>
                <Typography variant="body-sm" color="muted" className="mb-4">
                  実際の曲技飛行パフォーマンスをご覧ください。迫力ある演技で、イベントをより魅力的に彩ります。
                </Typography>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* メイン動画 - プロモーション用または代表的な動画 */}
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800 border border-brand-primary/30 shadow-lg">
                      {PROMOTION_VIDEO_ID ? (
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${PROMOTION_VIDEO_ID}?rel=0&modestbranding=1`}
                          title="ウイスキーパパ 曲技飛行パフォーマンス"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-6">
                            <Youtube className="w-16 h-16 text-brand-primary mx-auto mb-4" />
                            <Typography variant="body-sm" className="text-gray-300 mb-3">
                              プロモーション動画を設定中
                            </Typography>
                            <a
                              href="https://www.youtube.com/channel/UCMix8_VmokzvDaWZ4w4Lfjg"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 transition-colors group"
                            >
                              <Typography variant="body-sm" className="font-semibold group-hover:underline">
                                YouTubeチャンネルで動画を確認
                              </Typography>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <Typography variant="body-sm" className="text-gray-400 text-center">
                      {PROMOTION_VIDEO_ID ? 'プロモーション動画' : '動画設定後、こちらに表示されます'}
                    </Typography>
                  </div>
                  {/* チャンネルリンク */}
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/30 flex items-center justify-center hover:border-brand-primary/50 transition-colors">
                      <a
                        href="https://www.youtube.com/channel/UCMix8_VmokzvDaWZ4w4Lfjg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center p-6 w-full h-full flex flex-col items-center justify-center group"
                      >
                        <Youtube className="w-16 h-16 text-brand-primary mb-4 group-hover:scale-110 transition-transform" />
                        <Typography variant="body-sm" className="text-gray-200 mb-2 font-semibold">
                          より多くの動画は
                        </Typography>
                        <Typography variant="body" className="text-brand-primary mb-2 font-bold group-hover:underline">
                          YouTubeチャンネル
                        </Typography>
                        <Typography variant="body-sm" color="muted">
                          でご覧いただけます
                        </Typography>
                        <div className="mt-3 flex items-center gap-1 text-brand-primary/70">
                          <Typography variant="body-sm" className="text-gray-400 text-xs">
                            過去のパフォーマンス・練習風景・エアショー動画
                          </Typography>
                        </div>
                      </a>
                    </div>
                    <Typography variant="body-sm" className="text-gray-400 text-center">
                      過去のパフォーマンス・練習風景
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center mt-0.5">
                      <Plane className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-gray-200 font-semibold mb-1">
                        柔軟な対応が可能
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        曲技飛行は「BOX」と呼ばれる空域内で実施するため、大きな飛行場がなくても、ある程度の見晴らしがあれば様々な場所でパフォーマンスが可能です。
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center mt-0.5">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-gray-200 font-semibold mb-1">
                        多様なイベントに対応
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        航空祭、地域のお祭り、企業イベント、スポーツイベントなど、様々なシーンで観客を魅了します。
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center mt-0.5">
                      <MapPin className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-gray-200 font-semibold mb-1">
                        プロフェッショナルな実績
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        国際大会での実績を持つパイロットによる、安全で迫力のある曲技飛行。13万人規模のイベントでも実績があります。
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center mt-0.5">
                      <Plane className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <Typography variant="body-sm" className="text-gray-200 font-semibold mb-1">
                        イベントの記憶に残る演出
                      </Typography>
                      <Typography variant="body-sm" color="muted">
                        迫力ある曲技飛行は、観客の心に深く刻まれる体験となります。SNSでも話題になり、イベントの認知度向上にも貢献します。
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-6 border-t border-gray-700/50">
                <div className="bg-brand-primary/10 rounded-lg p-6 border border-brand-primary/20">
                  <Typography variant="h4" color="brand" className="mb-3">
                    こんなイベントでも呼べます
                  </Typography>
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        航空祭・エアショー
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        地域のお祭り・フェスティバル
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        企業イベント・記念式典
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        スポーツイベント・マラソン大会
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        観光イベント・地域活性化イベント
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      <Typography variant="body-sm" className="text-gray-300">
                        その他、見晴らしの良い場所でのイベント
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="body-sm" color="muted" className="mb-4 italic">
                    ※ 曲技飛行の実施には、空域の確保や安全面の確認が必要です。詳細はお問い合わせください。
                  </Typography>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <a
                      href="https://twitter.com/ja14wp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/50 rounded-lg text-brand-primary transition-all group"
                    >
                      <Twitter className="w-5 h-5" />
                      <Typography variant="body-sm" className="font-semibold group-hover:underline">
                        MASAのX（@ja14wp）でお問い合わせ
                      </Typography>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <Typography variant="body-sm" color="muted" className="sm:ml-auto">
                      イベント情報・参加実績もこちらでご確認いただけます
                    </Typography>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <Typography variant="body-sm" color="muted">
            各イベントの日程や参加については、公式発表をご確認ください。最新情報は公式SNSでもお知らせします。
          </Typography>
        </motion.div>
      </div>
    </div>
  );
};

export default Schedule;

