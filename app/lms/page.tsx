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
  correct: string;
  explanation: string;
  category: string;
}

export default function LMSPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<QuizItem | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchCategories()
      } else {
        router.push('/login')
      }
      setLoading(false)
    }

    getUser()
  }, [router])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('category')
      
      if (error) throw error

      const uniqueCategories = [...new Set(data?.map(item => item.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  async function fetchQuestionsForCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('category', category)
        .order('id')
      
      if (error) throw error

      // Randomly select 10 questions
      const shuffled = data.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 10)

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
    setSelectedCategory(category)
    fetchQuestionsForCategory(category)
  }

  function handleAnswer(selectedAnswer: string) {
    if (currentQuestion) {
      const correct = selectedAnswer === currentQuestion.correct
      setIsCorrect(correct)
      if (correct) {
        setScore(score + 1)
      }
      setAnsweredQuestions(answeredQuestions + 1)
      setShowFeedback(true)
    }
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentQuestion(quizQuestions[currentQuestionIndex + 1])
      setShowFeedback(false)
    } else {
      // Quiz finished
      alert(`クイズ終了！あなたのスコア: ${score}/${totalQuestions}`)
      // Reset the quiz or navigate to a results page
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
                {['answer1', 'answer2', 'answer3', 'answer4'].map((answerKey) => (
                  <li key={answerKey}>
                    <button 
                      onClick={() => handleAnswer(currentQuestion[answerKey as keyof QuizItem] as string)}
                      className="w-full bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                      {currentQuestion[answerKey as keyof QuizItem]}
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