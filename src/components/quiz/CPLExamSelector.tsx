import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import supabase from '../../utils/supabase';

interface CPLSubject {
  main_subject: string;
  sub_subject: string;
  question_count: number;
}

interface CPLExamSettings {
  subjects: string[];
  questionCount: number;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  reviewMode: boolean;
}

interface CPLExamSelectorProps {
  onStartExam: (settings: CPLExamSettings) => void;
}

const CPLExamSelector: React.FC<CPLExamSelectorProps> = ({ onStartExam }) => {
  const { theme } = useTheme();
  
  const [subjects, setSubjects] = useState<CPLSubject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(40);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 科目データを読み込み
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('unified_cpl_questions')
          .select('main_subject, sub_subject')
          .order('main_subject, sub_subject');

        if (error) throw error;

        // 科目ごとの問題数を集計
        const subjectCounts: { [key: string]: number } = {};
        data?.forEach(item => {
          const key = `${item.main_subject}::${item.sub_subject}`;
          subjectCounts[key] = (subjectCounts[key] || 0) + 1;
        });

        const subjectList: CPLSubject[] = Object.entries(subjectCounts).map(([key, count]) => {
          const [main_subject, sub_subject] = key.split('::');
          return { main_subject, sub_subject, question_count: count };
        });

        setSubjects(subjectList);
      } catch (err) {
        console.error('Failed to load subjects:', err);
        setError('科目データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, []);

  const handleSubjectToggle = (subjectKey: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectKey)
        ? prev.filter(s => s !== subjectKey)
        : [...prev, subjectKey]
    );
  };

  const handleSelectAll = () => {
    const allSubjects = subjects.map(s => `${s.main_subject}::${s.sub_subject}`);
    setSelectedSubjects(allSubjects);
  };

  const handleDeselectAll = () => {
    setSelectedSubjects([]);
  };

  const handleStartExam = () => {
    if (selectedSubjects.length === 0) {
      setError('少なくとも1つの科目を選択してください');
      return;
    }

    const settings: CPLExamSettings = {
      subjects: selectedSubjects,
      questionCount,
      timeLimitMinutes,
      shuffleQuestions,
      reviewMode
    };

    onStartExam(settings);
  };

  const totalAvailableQuestions = subjects
    .filter(s => selectedSubjects.includes(`${s.main_subject}::${s.sub_subject}`))
    .reduce((sum, s) => sum + s.question_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 主科目でグループ化
  const groupedSubjects = subjects.reduce((acc, subject) => {
    if (!acc[subject.main_subject]) {
      acc[subject.main_subject] = [];
    }
    acc[subject.main_subject].push(subject);
    return acc;
  }, {} as { [key: string]: CPLSubject[] });

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-lg p-6`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          CPL学科試験問題
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          事業用操縦士（飛行機）学科試験対策問題から出題範囲を選択してください
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 科目選択 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
            出題科目を選択（全{subjects.reduce((sum, s) => sum + s.question_count, 0)}問）
          </label>
          <div className="space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              すべて選択
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
            >
              すべて解除
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedSubjects).map(([mainSubject, subSubjects]) => (
            <div key={mainSubject} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {mainSubject}
              </h3>
              <div className="space-y-2">
                {subSubjects.map((subject) => {
                  const subjectKey = `${subject.main_subject}::${subject.sub_subject}`;
                  const isSelected = selectedSubjects.includes(subjectKey);
                  
                  return (
                    <label
                      key={subjectKey}
                      className="flex items-center p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSubjectToggle(subjectKey)}
                        className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {subject.sub_subject}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({subject.question_count}問)
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 試験設定 */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          試験設定
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 問題数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              出題問題数
            </label>
            <input
              type="number"
              min="1"
              max={totalAvailableQuestions}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              選択科目から最大{totalAvailableQuestions}問
            </p>
          </div>

          {/* 制限時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              制限時間（分）
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* オプション設定 */}
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={shuffleQuestions}
              onChange={(e) => setShuffleQuestions(e.target.checked)}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              問題順序をランダムにする
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reviewMode}
              onChange={(e) => setReviewMode(e.target.checked)}
              className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              復習モード（解答後すぐに解説を表示）
            </span>
          </label>
        </div>
      </div>

      {/* 開始ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleStartExam}
          disabled={selectedSubjects.length === 0}
          className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
            selectedSubjects.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          試験を開始する
        </button>
      </div>
    </div>
  );
};

export default CPLExamSelector; 