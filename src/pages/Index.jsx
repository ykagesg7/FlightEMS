import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PolarAngleAxis, Tooltip } from 'recharts';
import { ArrowRight, Bell, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Index() {
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Communityの投稿機能を実装しました。", date: "2024-09-19" },
    { id: 2, title: "Flight Tipsページを開発中です。ブログの閲覧やコメントができるようにしています。", date: "2024-09-19" },
    { id: 3, title: "Flight Planning機能を開発中です。", date: "2024-09-19" },
  ]);

  const [topPerformers, setTopPerformers] = useState([]);
  const [courseCompletionData, setCourseCompletionData] = useState([]);

  useEffect(() => {
    fetchTopPerformers();
    fetchCourseCompletionData();
  }, []);

  async function fetchTopPerformers() {
    const { data, error } = await supabase
      .from('user_quiz_results')
      .select(`
        user_id,
        is_correct,
        profiles (username)
      `)
      .order('answered_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching top performers:', error);
      return;
    }

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
        progress: Math.round((scores.correct / scores.total) * 100)
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    setTopPerformers(topPerformers);
  }

  async function fetchCourseCompletionData() {
    const { data, error } = await supabase
      .from('user_quiz_results')
      .select('category, is_correct');

    if (error) {
      console.error('Error fetching course completion data:', error);
      return;
    }

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
      completion: Math.round((stats.completed / stats.total) * 100),
      fill: `hsl(${index * 60}, 70%, 50%)`,
    }));

    setCourseCompletionData(formattedData);
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
          <h1 className="text-6xl font-bold text-white">Break Through</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
            Flight Academy
          </h2>
          <p className="text-2xl text-blue-200">
            Learn to fly, Aim high, Soar the sky, together.
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
                  {topPerformers.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-white">{student.name}</TableCell>
                      <TableCell>
                        <Progress value={student.progress} className="w-full" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-all duration-300 mb-16">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-300">Course Completion Overview</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
        
        <div className="text-center space-y-6">
          <Button asChild className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105">
            <Link to="/login" className="flex items-center">
              Start Your Journey <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <div>
            <span className="text-blue-200">Already a member? </span>
            <Button asChild variant="link" className="text-white hover:text-blue-300">
              <Link to="/login">Log in here</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}