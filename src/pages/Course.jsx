import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {Link, useNavigate} from 'react-router-dom';

const Course = () => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

    const lessons = [
    { id: 1, title: 'Regulations', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 2, title: 'Weather', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 3, title: 'Aerodynamics', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 4, title: 'Aircraft structure and systems', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 5, title: 'Operation', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 6, title: 'Navigation', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 7, title: 'ATC', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 8, title: 'CRM', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 9, title: 'Emergency', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 10, title: 'HFs', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    // Add more lessons as needed
  ];

  const quizzes = [
    {
      question: 'What is the primary purpose of ailerons?',
      options: [
        { id: 'a', text: 'Control pitch' },
        { id: 'b', text: 'Control roll' },
        { id: 'c', text: 'Control yaw' },
        { id: 'd', text: 'Increase lift' },
      ],
      correctAnswer: 'b',
    },
    // Add more quizzes for each lesson
  ];

  useEffect(() => {
    // Fetch course progress from Supabase here
  }, []);

  const handleLessonComplete = () => {
    setShowQuiz(true);
  };

  const handleQuizSubmit = () => {
    if (selectedAnswer === quizzes[currentLesson].correctAnswer) {
      setScore(score + 1);
    }
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
      setShowQuiz(false);
      setSelectedAnswer('');
    } else {
      // Course completed logic here
      alert(`Course completed! Your score: ${score}/${lessons.length}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Commercial Pilot Oral Course</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>
            <Link to ="/test">総合テスト</Link>
          </CardTitle>
        </CardHeader>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{lessons[currentLesson].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <iframe
              src={lessons[currentLesson].videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          {!showQuiz && (
            <Button onClick={handleLessonComplete}>Complete Lesson</Button>
          )}
        </CardContent>
      </Card>

      {showQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>理解度テスト</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{quizzes[currentLesson].question}</p>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {quizzes[currentLesson].options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleQuizSubmit} className="mt-4">回答する</Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(currentLesson / lessons.length) * 100} className="w-full" />
          <p className="mt-2">{currentLesson} of {lessons.length} lessons completed</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Course;