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
    question: "相対湿度が100%に達したとき、空気中で何が起こりますか？",
    options: [
      "空気が乾燥する",
      "水蒸気が凝結し始める",
      "水蒸気が蒸発し始める",
      "温度が急上昇する"
    ],
    correctAnswer: 1
  },
  {
    question: "空気が上昇して冷却される現象は何と呼ばれますか？",
    options: [
      "放射冷却",
      "断熱膨張",
      "熱伝導",
      "潜熱吸収"
    ],
    correctAnswer: 1
  },
  {
    question: "露点温度とは何ですか？",
    options: [
      "空気中の水蒸気が飽和する温度",
      "空気が最も乾燥する温度",
      "水が沸騰する温度",
      "地表の温度"
    ],
    correctAnswer: 0
  },
  {
    question: "雲が形成される主なプロセスはどれですか？",
    options: [
      "水蒸気の蒸発",
      "水蒸気の凝結",
      "水の融解",
      "水の沈殿"
    ],
    correctAnswer: 1
  },
  {
    question: "水蒸気が凝結するときに放出される熱エネルギーを何と呼びますか？",
    options: [
      "顕熱",
      "潜熱",
      "比熱",
      "融解熱"
    ],
    correctAnswer: 1
  },
  {
    question: "湿潤断熱減率はおよそ何℃/1,000フィートですか？",
    options: [
      "約0.1℃",
      "約0.5℃",
      "約1℃",
      "約5℃"
    ],
    correctAnswer: 2
  },
  {
    question: "積乱雲の形成に必要な条件はどれですか",
    options: [
      "強い下降気流と乾燥した空気",
      "強い上昇気流と大量の水蒸気",
      "安定した大気と低湿度",
      "高気圧と冷たい空気"
    ],
    correctAnswer: 1
  },
  {
    question: "過冷却の水滴が航空機の表面に衝突して起こる現象は何ですか？",
    options: [
      "着氷",
      "蒸発",
      "凝縮",
      "昇華"
    ],
    correctAnswer: 0
  },
  {
    question: "霧が形成される主な原因は何ですか？",
    options: [
      "地表面が温められることによる空気の上昇",
      "相対湿度が100%に達し、水蒸気が凝結すること",
      "乾燥した空気が流入すること",
      "高気圧の影響で空気が沈降すること"
    ],
    correctAnswer: 1
  },
  {
    question: "水蒸気が気象現象に与える影響として正しくないものはどれですか",
    options: [
      "雲の形成",
      "雷雲の生成",
      "霧の発生",
      "磁場嵐の発生"
    ],
    correctAnswer: 3
  }
];

const WeatherBasics5 = () => {
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
          } else if (data?.completed_units?.includes('weather-basics-2-2')) {
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
                  completed_units: ['weather-basics-2-2']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-basics-2-2')) {
              completedUnits.push('weather-basics-2-2');
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
          description: "水蒸気と気象への影響の学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">水蒸気と気象への影響</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！水蒸気と気象への影響の学習を完了しました。
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
                src="/Weather/Weather1-2-2.html"
                className="w-full h-[600px] border-0"
                title="大気の層とその特徴"
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

export default WeatherBasics5;