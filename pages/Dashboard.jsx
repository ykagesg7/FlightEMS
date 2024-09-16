// Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const Dashboard = () => {
  const { user } = useAuth();
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);
  const [categoryAccuracy, setCategoryAccuracy] = useState({});
  const [courseProgress, setCourseProgress] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // 総回答数と正答数を取得
      const { data: answersData, error: answersError } = await supabase
        .from('user_quiz_results')
        .select('is_correct')
        .eq('user_id', user.id);

      if (answersError) throw answersError;

      const totalAnswers = answersData.length;
      const correctAnswers = answersData.filter(answer => answer.is_correct).length;

      setTotalAnswers(totalAnswers);
      setOverallAccuracy(totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0);

      // カテゴリー別の正答率を取得
      const { data: categoryData, error: categoryError } = await supabase
        .from('user_quiz_results')
        .select('category, is_correct')
        .eq('user_id', user.id);

      if (categoryError) throw categoryError;

      const categoryAccuracyData = {};
      categoryData.forEach(result => {
        if (!categoryAccuracyData[result.category]) {
          categoryAccuracyData[result.category] = { total: 0, correct: 0 };
        }
        categoryAccuracyData[result.category].total++;
        if (result.is_correct) {
          categoryAccuracyData[result.category].correct++;
        }
      });

      Object.keys(categoryAccuracyData).forEach(category => {
        const { total, correct } = categoryAccuracyData[category];
        categoryAccuracyData[category] = total > 0 ? (correct / total) * 100 : 0;
      });

      setCategoryAccuracy(categoryAccuracyData);

      // Course Progress（カテゴリー別の進捗率）を取得
      const { data: allQuestionsData, error: allQuestionsError } = await supabase
        .from('quiz_questions')
        .select('category');

      if (allQuestionsError) throw allQuestionsError;

      const totalQuestionsByCategory = {};
      allQuestionsData.forEach(question => {
        totalQuestionsByCategory[question.category] = (totalQuestionsByCategory[question.category] || 0) + 1;
      });

      const progressData = Object.keys(totalQuestionsByCategory).map(category => ({
        subject: category,
        progress: (categoryAccuracyData[category]?.correct || 0) / totalQuestionsByCategory[category] * 100
      }));

      setCourseProgress(progressData);
      setTotalQuestions(allQuestionsData.length);

      // Weekly Activity（週間アクティビティ）を取得
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: weeklyData, error: weeklyError } = await supabase
        .from('user_quiz_results')
        .select('answered_at')
        .eq('user_id', user.id)
        .gte('answered_at', oneWeekAgo.toISOString());

      if (weeklyError) throw weeklyError;

      const activityByDay = {};
      weeklyData.forEach(result => {
        const day = new Date(result.answered_at).toLocaleDateString('en-US', { weekday: 'short' });
        activityByDay[day] = (activityByDay[day] || 0) + 1;
      });

      const weeklyActivityData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
        name: day,
        questions: activityByDay[day] || 0
      }));

      setWeeklyActivity(weeklyActivityData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Welcome back, {user?.username || user?.email || 'Student'}!</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Answers: {totalAnswers} / {totalQuestions}</p>
            <p>Overall Accuracy: {overallAccuracy.toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(categoryAccuracy).map(([category, accuracy]) => (
              <div key={category} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm sm:text-base">{category}</span>
                  <span className="text-sm sm:text-base">{accuracy.toFixed(2)}%</span>
                </div>
                <Progress value={accuracy} className="w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {courseProgress.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm sm:text-base">{item.subject}</span>
                  <span className="text-sm sm:text-base">{item.progress.toFixed(2)}%</span>
                </div>
                <Progress value={item.progress} className="w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="questions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;