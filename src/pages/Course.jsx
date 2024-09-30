import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle } from 'lucide-react';

const Course = () => {
  const [user, setUser] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  const lessons = [
    { id: 1, title: 'Mission Planning', route: '/mission-planning', section: 'mission_planning' },
    // Add more lessons here as they are created
  ];

  useEffect(() => {
    const fetchUserAndProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('section')
          .eq('user_id', user.id)
          .not('completed', 'is', null);

        if (error) {
          console.error('Error fetching user progress:', error);
        } else {
          setCompletedLessons(data.map(item => item.section));
        }
      }
    };

    fetchUserAndProgress();
  }, []);

  const calculateProgress = () => {
    return (completedLessons.length / lessons.length) * 100;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fighter Pilot Course</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Link to="/test">事業用関連（４択問題）</Link>
          </CardTitle>
        </CardHeader>
      </Card>
      
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Link to={lesson.route}>{lesson.title}</Link>
              {completedLessons.includes(lesson.section) && (
                <CheckCircle className="text-green-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={lesson.route}>
              <Button>Go to Lesson</Button>
            </Link>
          </CardContent>
        </Card>
      ))}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="w-full" />
          <p className="mt-2">{completedLessons.length} of {lessons.length} lessons completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Course;