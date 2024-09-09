import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/lib/supabaseClient';
import { Plane } from 'lucide-react';

class QuizItem {
  constructor(id, question, answer1, answer2, answer3, answer4, correct, explanation, category) {
    this.id = id;
    this.question = question;
    this.answer1 = answer1;
    this.answer2 = answer2;
    this.answer3 = answer3;
    this.answer4 = answer4;
    this.correct = correct;
    this.explanation = explanation;
    this.category = category;
  }
}

export default function TestPage() {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
  
      if (user) {
        setUser(user);
        fetchCategories();
      } else {
        navigate('/login');
      }
  
      setLoading(false);
    }
  
    getUser();
  }, [navigate]);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('category')
      
      if (error) throw error;
  
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }
    
  async function fetchQuestionsForCategory(category) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category)
        .order('id')
      
      if (error) throw error;
  
      const shuffled = data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
  
      setQuizQuestions(selected);
      setCurrentQuestionIndex(0);
      setCurrentQuestion(selected[0]);
      setShowFeedback(false);
      setScore(0);
      setAnsweredQuestions(0);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  function handleCategorySelect(category) {
    setSelectedCategory(category);
    fetchQuestionsForCategory(category);
  }

  function handleAnswer(selectedAnswer) {
    if (currentQuestion) {
      const answerMap = {
        'answer1': 0,
        'answer2': 1,
        'answer3': 2,
        'answer4': 3,
      };
  
      const selectedAnswerIndex = answerMap[selectedAnswer];
      const correct = selectedAnswerIndex === currentQuestion.correct;
      setIsCorrect(correct);
      
      if (correct) {
        setScore(score + 1);
      }
      setAnsweredQuestions(answeredQuestions + 1);
      setShowFeedback(true);
    }
  }

  function handleNextQuestion() {
    // 現在の問題インデックスがクイズ問題の総数-1より小さい場合、次の問題に進む
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentQuestion(quizQuestions[currentQuestionIndex + 1])
      setShowFeedback(false)
    } else {
      // クイズ終了
      alert(`クイズ終了！あなたのスコア: ${score}/${totalQuestions}`)
      // クイズをリセットするか、結果ページに遷移
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Router will redirect to login page
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <main className="flex-grow pt-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            総合テスト
          </h1>

          <div className="mb-8">
            <Select onValueChange={handleCategorySelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="カテゴリーを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="mb-4">
              <Progress value={(answeredQuestions / totalQuestions) * 100} className="w-full" />
              <p className="text-sm text-gray-600 mt-2">
                進捗: {answeredQuestions} / {totalQuestions} 問
              </p>
            </div>
          )}

          {currentQuestion && !showFeedback && (
            <div>
              <h2 className="text-2xl mb-4">{currentQuestion.question}</h2>
              <ul className="space-y-2">
                {(['answer1', 'answer2', 'answer3', 'answer4'] ).map((answerKey) => (
                  <li key={answerKey}>
                    <button 
                      onClick={() => handleAnswer(answerKey)}
                      className="w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                      {currentQuestion[answerKey]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showFeedback && (
            <div className="mt-4">
              <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? '正解です！' : '不正解です。'}
              </h3>
              <p className="mt-2">{currentQuestion?.explanation}</p>
              <Button 
                onClick={handleNextQuestion} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out"
              >
                次の問題へ
              </Button>
            </div>
          )}

          <p className="mt-4 text-xl">現在のスコア: {score}</p>
        </div>
      </main>
    </div>
  )
}