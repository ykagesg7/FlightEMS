import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const comprehensionTest = [
  {
    question: "等温層とはどのような層ですか？",
    options: [
      "高度が上がると気温が上昇する層",
      "高度が上がると気温が低下する層",
      "高度が上がっても気温がほとんど変化しない層",
      "気温が急激に変動する層"
    ],
    correctAnswer: 2
  },
  {
    question: "逆転層では気温はどのように変化しますか？",
    options: [
      "高度が上がると気温が低下する",
      "高度が上がると気温が上昇する",
      "高度によらず気温は一定",
      "気温が不規則に変動する"
    ],
    correctAnswer: 1
  },
  {
    question: "逆転層が形成されやすいのはどのような条件のときですか？",
    options: [
      "日中の太陽放射が強いとき",
      "夜間の放射冷却が強いとき",
      "強風が吹いているとき",
      "雨が降っているとき"
    ],
    correctAnswer: 1
  },
  {
    question: "地上逆転層（接地逆転層）の主な発生原因は何ですか？",
    options: [
      "地表の温暖化",
      "地表の放射冷却",
      "上空の寒気の移流",
      "前線の通過"
    ],
    correctAnswer: 1
  },
  {
    question: "逆転層があるときに地表付近で発生しやすい気象現象はどれですか？",
    options: [
      "雷雨",
      "霧やもや",
      "強い上昇気流",
      "豪雪"
    ],
    correctAnswer: 1
  },
  {
    question: "逆転層が航空機の運航に与える影響として正しくないものはどれですか？",
    options: [
      "ウインドシアの発生",
      "着氷のリスク増加",
      "視程の低下による離着陸への影響",
      "エンジン出力の大幅な増加"
    ],
    correctAnswer: 3
  },
  {
    question: "逆転層付近で風速や風向が急激に変化する現象を何といいますか？",
    options: [
      "ジェット気流",
      "ウインドシア",
      "フェーン現象",
      "ダウン・バースト"
    ],
    correctAnswer: 1
  },
  {
    question: "等温層や逆転層が存在すると、大気の安定度はどうなりますか？",
    options: [
      "非常に不安定になる",
      "安定度が高くなる",
      "安定度が低下する",
      "影響はない"
    ],
    correctAnswer: 1
  },
  {
    question: "逆転層が存在することで起こる大気汚染に関する問題は何ですか？",
    options: [
      "汚染物質が上昇し、広域に拡散する",
      "汚染物質が地表付近に滞留する",
      "汚染物質が分解されやすくなる",
      "湿った空気は温度が一定である汚染物質がなくなる"
    ],
    correctAnswer: 1
  },
  {
    question: "逆転層があるとき、航空機の離着陸時に特に注意すべきことは何ですか？",
    options: [
      "エンジンの過熱",
      "燃料の増加消費",
      "視程不良とウインドシアのリスク",
      "通信設備の不具合"
    ],
    correctAnswer: 2
  }
];

const WeatherBasics7 = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_progress')
            .select('completed_units')
            .eq('user_id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('No existing progress found for this user');
            } else {
              throw error;
            }
          } else if (data?.completed_units?.includes('weather-basics-3-2')) {
            setTestCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
        toast({
          title: "エラー",
          description: "完了状況の確認中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    };

    checkCompletion();
  }, [toast]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleTestSubmit = async () => {
    const score = comprehensionTest.reduce((acc, question, index) => {
      return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const passed = score >= comprehensionTest.length * 0.8; // 80%以上で合格

    if (passed) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('user_progress')
            .select('completed_units')
            .eq('user_id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              await supabase
                .from('user_progress')
                .insert({ 
                  user_id: user.id, 
                  completed_units: ['weather-basics-3-2']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-basics-3-2')) {
              completedUnits.push('weather-basics-3-2');
              await supabase
                .from('user_progress')
                .update({ completed_units: completedUnits })
                .eq('user_id', user.id);
            }
          }
        }
        setTestCompleted(true);
        await toast({
          title: "おめでとうございます！",
          description: "等温層と逆転層の学習を完了しました。",
        });
        navigate('/course');
      } catch (error) {
        console.error('Error updating user progress:', error);
        await toast({
          title: "エラー",
          description: "進捗の更新中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    } else {
      await toast({
        title: "もう一度挑戦してください",
        description: `正解数: ${score}/${comprehensionTest.length}`,
        variant: "destructive",
      });
    }
  };

  const handleRetakeTest = () => {
    setSelectedAnswers({});
    setTestCompleted(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">等温層と逆転層</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！等温層と逆転層の学習を完了しました。
            </p>
            <Button onClick={handleRetakeTest} className="mr-4">
              テストを再受験
            </Button>
            <Button onClick={() => navigate('/course')}>
              コース一覧に戻る
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="slides" className="w-full">
                
        <TabsContent value="slides">
          <Card>
            <CardHeader>
              <CardTitle>スライドプレゼンテーション</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src="/Weather/Weather1-3-2.html"
                className="w-full h-[600px] border-0"
                title="気温の減率とその意味"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="slides">学習内容</TabsTrigger>
          <TabsTrigger value="test">理解度テスト</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>理解度テスト</CardTitle>
            </CardHeader>
            <CardContent>
              {comprehensionTest.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
                  <RadioGroup
                    value={selectedAnswers[questionIndex]}
                    onValueChange={(value) => handleAnswerSelect(questionIndex, parseInt(value))}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionIndex} id={`q${questionIndex}-a${optionIndex}`} />
                        <Label htmlFor={`q${questionIndex}-a${optionIndex}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button 
                onClick={handleTestSubmit} 
                className="mt-4"
                disabled={Object.keys(selectedAnswers).length < comprehensionTest.length}
              >
                テストを提出
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WeatherBasics7;