// app/lms/page.tsx

"use client";

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "../../components/ui/button"
import { Plane } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Progress } from "../../components/ui/progress"

interface QuizItem {
  id: number;
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correct: number;
  explanation: string;
  category: string;
}

export default function LMSPage() {

// クイズのカテゴリーを格納
  const [categories, setCategories] = useState<string[]>([]) 
// 選択されたカテゴリーを格納
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) 
// 現在の問題を格納
  const [currentQuestion, setCurrentQuestion] = useState<QuizItem | null>(null) 
// クイズの問題を格納
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([]) 
// 現在の問題のインデックスを格納
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
// スコアを格納  
  const [score, setScore] = useState(0) 
// クイズの総問題数を格納
  const [totalQuestions, setTotalQuestions] = useState(10) 
// 回答済みの問題数を格納
  const [answeredQuestions, setAnsweredQuestions] = useState(0) 
// ログインユーザー情報を格納
  const [user, setUser] = useState<any>(null)
// 読み込み状態を格納
  const [loading, setLoading] = useState(true) 
// フィードバック表示状態を格納
  const [showFeedback, setShowFeedback] = useState(false) 
// 正解かどうかを格納する変数
  const [isCorrect, setIsCorrect] = useState(false) 
// ルーティングオブジェクト
  const router = useRouter() 

  useEffect(() => {
    // ログインユーザー情報を取得
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()

      // ユーザー情報から、ユーザー情報を設定し、カテゴリーを取得
      if (user) {
        setUser(user)
        fetchCategories()

      // ユーザー情報が取得できなかった場合、ログインページへ戻る
      } else {
        router.push('/login')
      }

      // 読み込み状態を終了
      setLoading(false) 
    }

    getUser() // getUser関数を呼び出す
  }, [router]) // routerが変更された場合にのみ実行

  async function fetchCategories() {
    try {
      // Supabaseからクイズのカテゴリーを取得
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('category')
      
      if (error) throw error

      // カテゴリーの重複を削除し、配列に格納
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []))
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchQuestionsForCategory(category: string) {
    try {
      // Supabaseから選択されたカテゴリーのクイズ問題を取得
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category)
        .order('id')
      
      if (error) throw error

      // 問題をランダムにシャッフルし、10問選択
      const shuffled = data.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 10)

      // クイズ問題、現在の問題インデックス、現在の問題、フィードバック表示状態、スコア、回答済み問題数を設定
      setQuizQuestions(selected)
      setCurrentQuestionIndex(0)
      setCurrentQuestion(selected[0])
      setShowFeedback(false)
      setScore(0)
      setAnsweredQuestions(0)
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  function handleCategorySelect(category: string) {
    // 選択されたカテゴリーを設定し、そのカテゴリーのクイズ問題を取得
    setSelectedCategory(category)
    fetchQuestionsForCategory(category)
  }

  function handleAnswer(selectedAnswer: 'answer1' | 'answer2' | 'answer3' | 'answer4') {
    // 現在の問題が存在する場合、回答処理を実行
    if (currentQuestion) {
      console.log("selectedAnswer:", selectedAnswer); // 選択された回答のログ出力
      console.log("currentQuestion.correct:", currentQuestion.correct); // 正解のログ出力

      const answerMap = {
        'answer1': 0,
        'answer2': 1,
        'answer3': 2,
        'answer4': 3,
      };

      // 選択された回答が正解かどうか判定
      const selectedAnswerIndex = answerMap[selectedAnswer];
      const correct = selectedAnswerIndex === currentQuestion.correct;
      console.log("correct:", correct); // 正解判定結果のログ出力
      setIsCorrect(correct); // ここで `setIsCorrect` を呼び出します
      
      if (correct) {
        // 正解の場合、スコアを1加算
        setScore(score + 1);
      }
      // 回答済み問題数を1加算
      setAnsweredQuestions(answeredQuestions + 1);
      // フィードバック表示状態をtrueに設定
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
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Router will redirect to login page
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <header className="bg-white text-gray-900 p-4 shadow-sm fixed w-full z-50">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold flex items-center">
            <Plane className="mr-2 text-blue-600" />
            <span className="font-sans tracking-wider">Flight Training LMS</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-blue-600 transition-colors text-sm font-medium">ホーム</Link>
            <Link href="/planner" className="hover:text-blue-600 transition-colors text-sm font-medium">飛行計画</Link>
          </nav>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out"
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/')
                  }}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex-grow pt-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Flight LMS Quiz</h1>

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
                {(['answer1', 'answer2', 'answer3', 'answer4'] as const).map((answerKey) => (
                  <li key={answerKey}>
                    <button 
                      onClick={() => handleAnswer(answerKey)} // answerKey を直接渡す
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

      <footer className="bg-gray-100 text-gray-600 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Flight Training LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}