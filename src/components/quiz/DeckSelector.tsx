import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuestionCategory, CardDeck, QuizSettings } from '../../types/quiz';
import supabase from '../../utils/supabase';

interface DeckSelectorProps {
  onStartQuiz: (settings: QuizSettings) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ onStartQuiz }) => {
  const { theme } = useTheme();

  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // クイズ設定の状態
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficultyLevels, setDifficultyLevels] = useState<string[]>(['easy', 'medium', 'hard']);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);

  // カテゴリを読み込み
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('question_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('カテゴリの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // 選択されたカテゴリのデッキを読み込み
  useEffect(() => {
    const loadDecks = async () => {
      if (!selectedCategoryId) {
        setDecks([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('card_decks')
          .select(`
            *,
            category:question_categories(*)
          `)
          .eq('category_id', selectedCategoryId)
          .order('title');

        if (error) throw error;
        setDecks(data || []);
      } catch (err) {
        console.error('Failed to load decks:', err);
        setError('デッキの読み込みに失敗しました');
      }
    };

    loadDecks();
  }, [selectedCategoryId]);

  const handleStartQuiz = () => {
    if (!selectedDeckId) {
      setError('デッキを選択してください');
      return;
    }

    const settings: QuizSettings = {
      deck_id: selectedDeckId,
      question_count: questionCount,
      difficulty_levels: difficultyLevels as ('easy' | 'medium' | 'hard')[],
      time_limit_minutes: timeLimitMinutes,
      shuffle_questions: shuffleQuestions,
      review_mode: reviewMode
    };

    onStartQuiz(settings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-lg p-6`}>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* カテゴリ選択 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          カテゴリを選択
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategoryId(category.id);
                setSelectedDeckId(null);
              }}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedCategoryId === category.id
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* デッキ選択 */}
      {selectedCategoryId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            デッキを選択
          </label>
          {decks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              選択したカテゴリにはデッキがありません
            </div>
          ) : (
            <div className="space-y-2">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDeckId === deck.id
                      ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {deck.title}
                  </h3>
                  {deck.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {deck.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* クイズ設定 */}
      {selectedDeckId && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            クイズ設定
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 問題数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                問題数
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* 制限時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                制限時間（分）
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* 難易度選択 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              難易度
            </label>
            <div className="flex space-x-4">
              {[
                { value: 'easy', label: '初級' },
                { value: 'medium', label: '中級' },
                { value: 'hard', label: '上級' }
              ].map((level) => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={difficultyLevels.includes(level.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDifficultyLevels([...difficultyLevels, level.value]);
                      } else {
                        setDifficultyLevels(difficultyLevels.filter(d => d !== level.value));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* その他の設定 */}
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                問題をシャッフルする
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reviewMode}
                onChange={(e) => setReviewMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                復習モード（間違えた問題を優先）
              </span>
            </label>
          </div>
        </div>
      )}

      {/* 開始ボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleStartQuiz}
          disabled={!selectedDeckId || difficultyLevels.length === 0}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          クイズを開始
        </button>
      </div>
    </div>
  );
};

export default DeckSelector; 