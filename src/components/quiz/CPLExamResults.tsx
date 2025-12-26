import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
// import EnhancedMistakeReview from './EnhancedMistakeReview'; // TODO: コンポーネント作成時に有効化
import { QuizAnswer } from '../../types';
import ReviewContentLink from '../learning/ReviewContentLink';

interface CPLExamResultsProps {
  sessionId: string;
  onRestartExam: () => void;
  onBackToSelection: () => void;
}

interface CPLExamSettings {
  subjects: string[];
  questionCount: number;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  reviewMode: boolean;
}

interface ExamSession {
  id: string;
  questions_attempted: number;
  questions_correct: number;
  total_time_spent: number;
  settings: CPLExamSettings;
  answers: QuizAnswer[];
  completed_at: string;
}

interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  percentage: number;
}

const CPLExamResults: React.FC<CPLExamResultsProps> = ({
  sessionId,
  onRestartExam,
  onBackToSelection
}) => {
  const [session, setSession] = useState<ExamSession | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);

        // セッション結果を取得
        const { data: sessionData, error: sessionError } = await supabase
          .from('quiz_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // 科目別統計を計算
        if (sessionData.answers && Array.isArray(sessionData.answers)) {
          // 問題IDから科目情報を取得
          const questionIds = sessionData.answers.map((a: QuizAnswer) => a.questionId);

          if (questionIds.length > 0) {
            const { data: questionsData, error: questionsError } = await supabase
              .from('unified_cpl_questions')
              .select('id, main_subject, sub_subject')
              .in('id', questionIds);

            if (questionsError) throw questionsError;

            // 科目別統計を集計
            const statsMap: { [key: string]: { total: number; correct: number } } = {};

            sessionData.answers.forEach((answer: QuizAnswer) => {
              const question = questionsData.find((q: { id: string; main_subject: string; sub_subject: string }) => q.id === answer.questionId);
              if (question) {
                const subjectKey = `${question.main_subject} - ${question.sub_subject}`;
                if (!statsMap[subjectKey]) {
                  statsMap[subjectKey] = { total: 0, correct: 0 };
                }
                statsMap[subjectKey].total++;
                if (answer.isCorrect) {
                  statsMap[subjectKey].correct++;
                }
              }
            });

            const stats: SubjectStats[] = Object.entries(statsMap).map(([subject, data]) => ({
              subject,
              total: data.total,
              correct: data.correct,
              percentage: Math.round((data.correct / data.total) * 100)
            }));

            setSubjectStats(stats);
          }
        }
      } catch (err) {
        console.error('Failed to load results:', err);
        setError('結果の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || '結果が見つかりませんでした'}</div>
          <button
            onClick={onBackToSelection}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.round((session.questions_correct / session.questions_attempted) * 100);
  const isPassed = scorePercentage >= 70; // CPL試験の合格基準
  const timeSpentMinutes = Math.round(session.total_time_spent / 60); // 秒を分に変換

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CPL学科試験結果
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          事業用操縦士（飛行機）学科試験対策
        </p>
      </div>

      {/* 総合結果 */}
      <div className="mb-8">
        <div className={`p-6 rounded-lg border-2 ${isPassed
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
          }`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
              {scorePercentage}%
            </div>
            <div className={`text-2xl font-semibold mb-2 ${isPassed ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
              {isPassed ? '合格' : '不合格'}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              {session.questions_correct} / {session.questions_attempted} 問正解
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              所要時間: {timeSpentMinutes}分
            </div>
          </div>
        </div>
      </div>

      {/* 合格基準の説明 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          事業用操縦士学科試験について
        </h3>
        <div className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
          <p>• 合格基準: 70点以上（100点満点）</p>
          <p>• 実際の試験は各科目20問、制限時間40分</p>
          <p>• 全5科目（航空工学、航空気象、空中航法、航空通信、航空法規）の合格が必要</p>
        </div>
      </div>

      {/* 科目別結果 */}
      {subjectStats.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            科目別結果
          </h2>
          <div className="space-y-3">
            {subjectStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {stat.subject}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.correct} / {stat.total} 問正解
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                    <div
                      className={`h-2 rounded-full ${stat.percentage >= 70 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`font-semibold min-w-[3rem] text-right ${stat.percentage >= 70
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    {stat.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学習アドバイス */}
      <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
          学習アドバイス
        </h3>
        <div className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
          {isPassed ? (
            <>
              <p>• おめでとうございます！合格基準を達成しています</p>
              <p>• 継続的な学習で知識を定着させましょう</p>
              <p>• 苦手分野があれば重点的に復習してください</p>
            </>
          ) : (
            <>
              <p>• 合格基準の70%に達していません</p>
              <p>• 特に正答率の低い科目を重点的に学習してください</p>
              <p>• 基礎知識の確認と過去問演習を繰り返しましょう</p>
            </>
          )}
        </div>
      </div>

      {/* 復習記事の推奨 */}
      {subjectStats.length > 0 && (
        <>
          {subjectStats
            .filter(stat => stat.percentage < 70)
            .map((stat, index) => (
              <ReviewContentLink
                key={index}
                subjectCategory={stat.subject.split(' - ')[0]} // メイン科目のみ使用
                accuracy={stat.percentage}
                questionIds={session?.answers?.map((a: QuizAnswer) => a.questionId) || []}
              />
            ))
          }
        </>
      )}

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestartExam}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
        >
          同じ設定で再挑戦
        </button>

        <button
          onClick={onBackToSelection}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
        >
          設定を変更して再挑戦
        </button>
      </div>

      {/* 試験情報 */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>試験完了日時: {new Date(session.completed_at).toLocaleString('ja-JP')}</p>
          <p className="mt-1">
            この結果は学習の参考用です。実際の試験とは異なる場合があります。
          </p>
        </div>
      </div>

      {/* EnhancedMistakeReview component removed - theme prop no longer needed */}
    </div>
  );
};

export default CPLExamResults;
