import { motion } from 'framer-motion';
import { Calendar, ExternalLink, MapPin, Plane, Twitter, Youtube } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Typography } from '../../components/ui';

// プロモーション動画の設定
// 特定の動画IDを設定する場合は、YouTube動画IDを指定してください
// 例: 'dQw4w9WgXcQ' (URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
const PROMOTION_VIDEO_ID = ''; // プロモーション用動画ID（空の場合はチャンネル最新動画を表示）

// 2026年 空のイベントスケジュール（将来的にはDB/CMSから取得）
// 日程は確定次第更新されます。各イベントの詳細は公式発表をご確認ください。
// ウイスキーパパの参加は未定です。
const scheduleData: Array<{
  id: string;
  date: string | null; // nullの場合は「未定」
  location: string;
  title: string;
  description: string;
  typicalDate: string; // 例年の開催時期
  sortOrder: number; // ソート順（3月=3, 5月=5, 8月=8, 9月=9, 10月=10, 11月=11, 12月=12）
  type: 'practice' | 'event' | 'demo';
}> = [
  // 確定イベント
  {
    id: '1',
    date: '2026-03-01',
    location: '小牧基地（愛知県小牧市）',
    title: '航空自衛隊 小牧基地航空祭（小牧基地オープンベース2026）',
    description: '航空自衛隊 小牧基地で開催されるオープンベース。ブルーインパルスの飛行展示、航空機地上展示、装備品展示など。一般開放時間8:30～15:00、入場無料。駐車場は基地内にないため、名鉄小牧線「牛山駅」からの公共交通機関利用推奨。',
    typicalDate: '2026年3月1日（日）',
    sortOrder: 3,
    type: 'event' as const,
  },
  {
    id: '2',
    date: '2026-03-07',
    location: '大阪国際空港（大阪府豊中市）',
    title: '空の日エアポートフェスティバル',
    description: '関西3空港（大阪国際空港・関西空港・神戸空港）の「空の日イベント」を2026年3月に統合開催。航空会社の格納庫見学、管制塔見学、制服着用体験、航空機部品展示など。雨天決行。一部プログラムは事前応募や当日整理券が必要。',
    typicalDate: '2026年3月7日（土）',
    sortOrder: 3,
    type: 'event' as const,
  },
  {
    id: '3',
    date: '2026-03-15',
    location: '石巻市（宮城県）',
    title: '第9回いしのまき復興マラソン',
    description: '東日本大震災からの復興を祈念して開催されるマラソン大会。ブルーインパルスの展示飛行が予定されている。沿道から空のパフォーマンスを楽しめる。',
    typicalDate: '2026年3月15日（日）',
    sortOrder: 3,
    type: 'event' as const,
  },
  {
    id: '4',
    date: '2026-05-03',
    location: '岩国航空基地（山口県岩国市）',
    title: '海上自衛隊/米海兵隊 岩国航空基地フレンドシップデー',
    description: '第47回を迎える日本最大級の航空イベント。13万人超の来場者を誇るゴールデンウィークの恒例イベント。海上自衛隊・米海兵隊の航空機展示や飛行演示。前日5/2にはインクルーシブデーの開催が予想される。',
    typicalDate: '2026年5月3日（日）',
    sortOrder: 5,
    type: 'event' as const,
  },
  // 例年開催（海上自衛隊）
  {
    id: '5',
    date: null,
    location: '鹿屋航空基地（鹿児島県鹿屋市）',
    title: 'エアーメモリアル in かのや',
    description: '海上自衛隊 鹿屋航空基地で開催される航空イベント。航空機の地上展示や飛行展示、海上自衛隊の活躍を間近で体験できる。2025年は4月27日に開催。',
    typicalDate: '例年4月下旬〜5月上旬',
    sortOrder: 5,
    type: 'event' as const,
  },
  {
    id: '6',
    date: null,
    location: '大村航空基地（長崎県大村市）',
    title: '海上自衛隊 大村航空基地 一般開放',
    description: '海上自衛隊 大村航空基地の一般開放イベント。おおむらキッズフェスタとして子供向け企画も開催。2025年は12月7日に開催実績あり。',
    typicalDate: '例年5月下旬〜12月',
    sortOrder: 5,
    type: 'event' as const,
  },
  // 例年開催（航空自衛隊・夏〜秋）
  {
    id: '7',
    date: null,
    location: '松島基地（宮城県東松島市）',
    title: '航空自衛隊 松島基地航空祭',
    description: '東北地方を代表する航空祭。ブルーインパルスをはじめとした飛行展示、航空機の地上展示。東松島夏まつりと同時開催の年あり。2025年は8月31日に開催。',
    typicalDate: '例年8月下旬',
    sortOrder: 8,
    type: 'event' as const,
  },
  {
    id: '8',
    date: null,
    location: '千歳基地周辺（北海道千歳市）',
    title: '千歳のまちの航空祭',
    description: '航空自衛隊 千歳基地周辺で開催される航空祭。ブルーインパルスの飛行展示が楽しめる。北海道を代表する空のイベント。2025年は9月7日に開催。',
    typicalDate: '例年9月上旬',
    sortOrder: 9,
    type: 'event' as const,
  },
  {
    id: '9',
    date: null,
    location: '全国の空港',
    title: '空の日・空の旬間（9月20日〜30日）',
    description: '9月20日は「空の日」、9月20日〜30日は「空の旬間」。1992年民間航空再開40周年を記念して制定。全国の空港で施設見学、航空教室、格納庫見学などのイベントを実施。空の日netで各空港の実施スケジュールを確認可能。',
    typicalDate: '例年9月20日〜30日',
    sortOrder: 9,
    type: 'event' as const,
  },
  {
    id: '10',
    date: null,
    location: '三沢基地（青森県三沢市）',
    title: '航空自衛隊 三沢基地航空祭',
    description: '航空自衛隊 三沢基地で開催される航空祭。ブルーインパルスの飛行展示、戦闘機の地上展示など。北東北の空を彩る秋の恒例イベント。2025年は9月21日に開催。',
    typicalDate: '例年9月下旬',
    sortOrder: 9,
    type: 'event' as const,
  },
  {
    id: '11',
    date: null,
    location: '岐阜基地（岐阜県各務原市）',
    title: '航空自衛隊 岐阜基地航空祭',
    description: '航空自衛隊 岐阜基地で開催される航空祭。ブルーインパルスの飛行展示、開発・試験が行われる航空機の展示など。2025年は10月12日に開催。',
    typicalDate: '例年10月中旬',
    sortOrder: 10,
    type: 'event' as const,
  },
  {
    id: '12',
    date: null,
    location: '芦屋基地（福岡県芦屋町）',
    title: '航空自衛隊 芦屋基地航空祭',
    description: '航空自衛隊 芦屋基地で開催される航空祭。飛行展示や地上展示で自衛隊機の迫力を体感。九州北部の恒例航空イベント。例年10月第2〜3週の日曜日。',
    typicalDate: '例年10月中旬',
    sortOrder: 10,
    type: 'event' as const,
  },
  {
    id: '13',
    date: null,
    location: '浜松基地（静岡県浜松市）',
    title: 'エアフェスタ浜松',
    description: '航空自衛隊 浜松基地で開催される航空祭。ブルーインパルスの飛行展示、F-2やF-15などの戦闘機展示。中部地方を代表する空のイベント。2025年は10月26日に開催。',
    typicalDate: '例年10月下旬',
    sortOrder: 10,
    type: 'event' as const,
  },
  {
    id: '14',
    date: null,
    location: '入間基地（埼玉県狭山市・入間市）',
    title: '航空自衛隊 入間航空祭',
    description: '航空自衛隊 入間基地で開催される航空祭。ブルーインパルスの飛行展示、輸送機・ヘリコプターなどの地上展示。関東を代表する秋の航空イベント。例年文化の日（11月3日）に開催。',
    typicalDate: '例年11月3日',
    sortOrder: 11,
    type: 'event' as const,
  },
  {
    id: '15',
    date: null,
    location: '徳島航空基地（徳島県小松島市）',
    title: '海上自衛隊 徳島航空基地 航空祭',
    description: '海上自衛隊 徳島航空基地で開催される航空祭。海上自衛隊機の飛行展示や地上展示。四国を代表する空のイベント。徳島小松島港では潜水艦一般公開（2026年2月15日予定）も別途開催。',
    typicalDate: '例年11月中旬',
    sortOrder: 11,
    type: 'event' as const,
  },
  {
    id: '16',
    date: null,
    location: '岡南飛行場（岡山県岡山市）',
    title: '岡南飛行場まつり',
    description: '岡南飛行場で開催される航空まつり。地域密着型の航空イベント。航空機の展示や関連イベントで空の魅力を体験できる。',
    typicalDate: '例年11月17日頃',
    sortOrder: 11,
    type: 'event' as const,
  },
  {
    id: '17',
    date: null,
    location: '築城基地（福岡県築上町）',
    title: '航空自衛隊 築城基地航空祭',
    description: '航空自衛隊 築城基地で開催される航空祭。戦闘機をはじめとした航空機の飛行展示・地上展示。九州の空を彩る秋の恒例イベント。2025年は11月30日に開催。',
    typicalDate: '例年11月下旬',
    sortOrder: 11,
    type: 'event' as const,
  },
  {
    id: '18',
    date: null,
    location: '百里基地（茨城県小美玉市）',
    title: '航空自衛隊 百里基地航空祭',
    description: '戦闘機の拠点として知られる百里基地で開催される航空祭。ブルーインパルスなど華麗な飛行展示が楽しめる。関東屈指の航空イベント。',
    typicalDate: '例年11月〜12月',
    sortOrder: 12,
    type: 'event' as const,
  },
  {
    id: '19',
    date: null,
    location: '新田原基地（宮崎県新富町）',
    title: '航空自衛隊 新田原基地エアフェスタ',
    description: '航空自衛隊 新田原基地で開催されるエアフェスタ。F-15戦闘機の拠点。F-35Bの展示飛行など最新鋭機も注目。2025年は12月7日に開催。',
    typicalDate: '例年12月上旬',
    sortOrder: 12,
    type: 'event' as const,
  },
];

/**
 * Schedule Page
 * 2026年の空のイベント（航空祭・空港イベント等）スケジュールを表示するページ
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
            2026年 空のイベントスケジュール
          </Typography>
          <Typography variant="body" className="text-gray-300 max-w-2xl mx-auto mb-4">
            航空自衛隊・海上自衛隊の航空祭、各空港のイベントなど、2026年に開催予定の空のイベントをまとめました。
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-2">
            各イベントの日程は公式発表をご確認ください。ウイスキーパパの参加は未定です。
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

        {/* Marketing Section - コメントアウト済み（復活時は false を true に変更） */}
        {false && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <Card variant="brand" padding="lg" className="border-brand-primary/50 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <CardHeader>
              <Typography variant="h2" color="brand" className="mb-3">
                あなたのイベントに彩りと感動を
              </Typography>
              <Typography variant="body" className="text-gray-300">
                航空祭だけではありません。見晴らしの良い場所があれば、様々なイベントで曲技飛行を披露できます。
              </Typography>
            </CardHeader>
            <CardContent>
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
        )}

        {/* Footer Note - コメントアウト済み（復活時は false を true に変更） */}
        {false && (
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
        )}
      </div>
    </div>
  );
};

export default Schedule;

