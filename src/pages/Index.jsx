import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis, Tooltip } from 'recharts';
import { ArrowRight, Bell, Trophy, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext'; // AuthContextをインポート

export default function Index() {
  const { user } = useAuth(); // AuthContextからユーザー情報を取得
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Courseページを実装しました。自分のペースで課目を学習できます。コンテンツは今後充実させていきます。", date: "2024-09-29" },
    { id: 2, title: "Flight Planning機能を実装しました。出発・到着地、Waypointを入力し、簡易的な計算結果と地図を表示します。引き続き機能拡張中です。", date: "2024-09-23" },
    { id: 3, title: "Communityの投稿機能を実装しました。", date: "2024-09-19" },
    
  ]);

  const [topPerformers, setTopPerformers] = useState([]);
  const [courseCompletionData, setCourseCompletionData] = useState([]);

  useEffect(() => {
    fetchTopPerformers();
    fetchCourseCompletionData();
  }, []);

  async function fetchTopPerformers() {
    try {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select(`
          user_id,
          is_correct,
          profiles (username)
        `)
        .order('answered_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const userScores = data.reduce((acc, result) => {
        const userId = result.user_id;
        const username = result.profiles?.username || `User ${userId.slice(0, 4)}`;
        if (!acc[userId]) {
          acc[userId] = { username, correct: 0, total: 0 };
        }
        acc[userId].total++;
        if (result.is_correct) {
          acc[userId].correct++;
        }
        return acc;
      }, {});

      const topPerformers = Object.entries(userScores)
        .map(([userId, scores]) => ({
          id: userId,
          name: scores.username,
          progress: Math.round((scores.correct / scores.total) * 100) || 0
        }))
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5);

      setTopPerformers(topPerformers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  }

  async function fetchCourseCompletionData() {
    try {
      const { data, error } = await supabase
        .from('user_quiz_results')
        .select('category, is_correct');

      if (error) throw error;

      const categoryData = data.reduce((acc, result) => {
        if (!acc[result.category]) {
          acc[result.category] = { completed: 0, total: 0 };
        }
        acc[result.category].total++;
        if (result.is_correct) {
          acc[result.category].completed++;
        }
        return acc;
      }, {});

      const formattedData = Object.entries(categoryData).map(([name, stats], index) => ({
        name,
        completion: Math.round((stats.completed / stats.total) * 100) || 0,
        fill: `hsl(${index * 60}, 70%, 50%)`,
      }));

      setCourseCompletionData(formattedData);
    } catch (error) {
      console.error('Error fetching course completion data:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src="/f16.png"
          alt="F-16 Fighter Jet"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white">Flight Academy</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-2xl text-blue-200">
            Learn to fly, Aim high, Soar the sky.
          </p>
          <p className="text-2xl text-blue-200">
            Break through, together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-blue-300">
                <Bell className="mr-2" /> Latest Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {announcements.map((announcement) => (
                  <li key={announcement.id} className="border-b border-blue-400/30 pb-4 last:border-b-0">
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="text-sm text-blue-200">{announcement.date}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center text-blue-300">
                <Trophy className="mr-2" /> Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-blue-300">Name</TableHead>
                    <TableHead className="text-blue-300">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.slice(0, 3).map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-white">{student.name}</TableCell>
                      <TableCell>
                        <Progress value={student.progress} className="w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {!user && topPerformers.length > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-blue-200 mb-2">ログインして全てのランキングを見る</p>
                  <Button asChild className="bg-blue-500 hover:bg-blue-600">
                    <Link to="/login">ログイン</Link>
                  </Button>
                </div>
              )}
              {topPerformers.length === 0 && (
                <p className="text-center text-blue-200 mt-4">現在、表示できるデータがありません。</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-all duration-300 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-300">Course Completion Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart 
                  cx="50%" 
                  cy="50%" 
                  innerRadius="10%" 
                  outerRadius="80%" 
                  barSize={20} 
                  data={courseCompletionData}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff', fontWeight: 600, fontSize: 14 }}
                    background
                    clockWise
                    dataKey="completion"
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    wrapperStyle={{
                      top: '50%',
                      right: 0,
                      transform: 'translate(0, -50%)',
                      lineHeight: '24px'
                    }}
                  />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#E5E7EB' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Lock className="mx-auto mb-4 text-blue-300" size={48} />
                <p className="text-xl mb-4">詳細なコース完了状況を見るにはログインが必要です</p>
                <Button asChild className="bg-blue-500 hover:bg-blue-600">
                  <Link to="/login">ログインして詳細を見る</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center space-y-6">
          {user ? (
            <Button asChild className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105">
              <Link to="/dashboard" className="flex items-center">
                ダッシュボードへ <ArrowRight className="ml-2" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105">
                <Link to="/login" className="flex items-center">
                  今すぐ始める <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <p className="text-blue-200">
                アカウントをお持ちの方は
                <Button asChild variant="link" className="text-white hover:text-blue-300">
                  <Link to="/login">こちらからログイン</Link>
                </Button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}