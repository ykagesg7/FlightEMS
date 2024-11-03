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
    question: "気温の減率とは何を示すものですか？",
    options: [
      "高度が上がるにつれて気温が上昇する割合",
      "高度が上がっても気温が変化しない現象",
      "高度が上がるにつれて気温が低下する割合",
      "高度と気温の関係が逆転する現象"
    ],
    correctAnswer: 2
  },
  {
    question: "国際標準大気（ISA）における標準の気温減率はどれですか？",
    options: [
      "約1℃/1,000ft",
      "約2℃/1,000ft",
      "約3℃/1,000ft",
      "約4℃/1,000ft"
    ],
    correctAnswer: 1
  },
  {
    question: "乾燥断熱減率の値として正しいのは次のうちどれですか？",
    options: [
      "約1℃/1,000ft",
      "約2℃/1,000ft",
      "約3℃/1,000ft",
      "約4℃/1,000ft"
    ],
    correctAnswer: 1
  },
  {
    question: "湿潤断熱減率が乾燥断熱減率より小さい理由は何ですか？",
    options: [
      "湿った空気は軽いため、上昇しやすいから",
      "水蒸気の凝結により潜熱が放出され、冷却が緩和されるから",
      "湿った空気は熱を吸収しやすいから",
      "水蒸気が蒸発して熱を奪うから"
    ],
    correctAnswer: 1
  },
  {
    question: "環境気温減率が乾燥断熱減率より大きい場合の大気の状態は何ですか？",
    options: [
      "安定",
      "条件付き不安定",
      "不安定",
      "中立"
    ],
    correctAnswer: 2
  },
  {
    question: "不安定な大気で発生しやすい気象現象はどれですか？",
    options: [
      "霧の発生",
      "積乱雲の形成",
      "逆転層の出現",
      "高気圧の停滞"
    ],
    correctAnswer: 1
  },
  {
    question: "航空機が乱気流に遭遇しやすいのは、どのような大気の安定度のときですか？",
    options: [
      "安定な大気",
      "不安定な大気",
      "等温層",
      "逆転層"
    ],
    correctAnswer: 1
  },
  {
    question: "標準大気において、海抜0ftでの気温が15℃のとき、高度5,000ftでの気温は何℃になりますか？",
    options: [
      "5℃",
      "10℃",
      "0℃",
      "-5℃"
    ],
    correctAnswer: 0
  },
  {
    question: "湿潤断熱減率が乾燥断熱減率より小さいことが示す意味は何ですか？",
    options: [
      "湿った空気は温度の低下が緩やかである",
      "湿った空気は温度の低下が急激である",
      "乾いた空気は温度が上昇する",
      "湿った空気は温度が一定である"
    ],
    correctAnswer: 0
  },
  {
    question: "大気の安定度が航空機の飛行計画に影響を与える理由として正しいものはどれですか？",
    options: [
      "大気の安定度によって飛行禁止区域が変わるため",
      "エンジンの出力が大きく変化するため",
      "乱気流や積乱雲の発生を予測し、飛行経路や高度を選択する必要があるため",
      "パイロットの視界が大きく遮られるため"
    ],
    correctAnswer: 2
  }
];

const WeatherBasics8 = () => {
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
          } else if (data?.completed_units?.includes('weather-basics-3-3')) {
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
                  completed_units: ['weather-basics-3-3']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-basics-3-3')) {
              completedUnits.push('weather-basics-3-3');
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
          description: "気圧高度計算の基礎の学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">気圧高度計算の基礎</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！気圧高度計算の基礎の学習を完了しました。
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
                src="/Weather/Weather1-3-3.html"
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

export default WeatherBasics8;