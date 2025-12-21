import React from 'react';
import { motion } from 'framer-motion';
import { Typography, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Calendar, MapPin, Plane } from 'lucide-react';

// 今シーズンのスケジュールデータ（将来的にはDB/CMSから取得）
const scheduleData = [
  {
    id: '1',
    date: '2025-01-15',
    location: '岡南飛行場',
    title: 'エアショー練習',
    description: 'シーズン開幕に向けた練習フライト',
    type: 'practice' as const,
  },
  {
    id: '2',
    date: '2025-02-20',
    location: '関西国際空港',
    title: 'エアショーイベント',
    description: '関西エアポートエアショー2025',
    type: 'event' as const,
  },
  {
    id: '3',
    date: '2025-03-10',
    location: '横田基地',
    title: 'フレンドシップデー',
    description: 'MCAS Iwakuni フレンドシップデー',
    type: 'event' as const,
  },
  {
    id: '4',
    date: '2025-04-05',
    location: '岡南飛行場',
    title: '一般公開デモフライト',
    description: 'ファン向けデモンストレーションフライト',
    type: 'demo' as const,
  },
];

/**
 * Schedule Page
 * 今シーズンのスケジュールを表示するページ
 */
const Schedule: React.FC = () => {
  // 日付でソート（未来のイベントを先に）
  const sortedSchedule = [...scheduleData].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const formatDate = (dateString: string) => {
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
          <Typography variant="h3" className="text-gray-300">
            今シーズンの予定
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(item.type)} border ${
                        item.type === 'practice' ? 'border-blue-400/30' :
                        item.type === 'event' ? 'border-whiskyPapa-yellow/30' :
                        'border-green-400/30'
                      }`}>
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

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Typography variant="body-sm" color="muted">
            スケジュールは変更になる可能性があります。最新情報は公式SNSをご確認ください。
          </Typography>
        </motion.div>
      </div>
    </div>
  );
};

export default Schedule;

