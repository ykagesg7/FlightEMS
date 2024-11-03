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
    question: "大気の層の中で、ほとんどの気象現象が発生するのはどの層ですか？",
    options: [
      "成層圏",
      "中間圏",
      "熱圏",
      "対流圏"
    ],
    correctAnswer: 3
  },
  {
    question: "対流圏では、高度が上がると気温はどのように変化しますか？",
    options: [
      "上昇する",
      "低下する",
      "一定である",
      "急激に変動する"
    ],
    correctAnswer: 1
  },
  {
    question: "成層圏で温度が上昇する主な原因は何ですか？",
    options: [
      "地球からの熱放射",
      "オゾン層による紫外線の吸収",
      "太陽風の影響",
      "大気密度の増加"
    ],
    correctAnswer: 1
  },
  {
    question: "電離層が存在する大気の層はどれですか？",
    options: [
      "対流圏",
      "成層圏",
      "中間圏",
      "熱圏"
    ],
    correctAnswer: 3
  },
  {
    question: "ジェット気流が存在する主な大気の層はどれですか？",
    options: [
      "対流圏",
      "成層圏",
      "中間圏",
      "熱圏"
    ],
    correctAnswer: 1
  },
  {
    question: "中間圏での温度変化はどのようになりますか？",
    options: [
      "高度が上がると温度は上昇する",
      "高度が上がると温度は低下する",
      "温度は一定である",
      "日中は上昇し、夜間は低下する"
    ],
    correctAnswer: 1
  },
  {
    question: "航空機の飛行に直接的な影響を与える大気の層はどれとどれですか？",
    options: [
      "成層圏と中間圏",
      "中間圏と熱圏",
      "対流圏と成層圏",
      "熱圏と宇宙空間"
    ],
    correctAnswer: 2
  },
  {
    question: "対流圏と成層圏の境界を何と呼びますか？",
    options: [
      "トロポポーズ(対流圏界面)",
      "ストラトポーズ(成層圏界面)",
      "メソポーズ(中間圏界面)",
      "サーモポーズ(熱圏界面)"
    ],
    correctAnswer: 0
  },
  {
    question: "熱圏で温度が非常に高くなるにもかかわらず、人体が熱を感じない理由は何ですか？",
    options: [
      "太陽からの熱が直接届かないため",
      "大気密度が非常に低く、熱の伝達が少ないため",
      "放射冷却が強いため",
      "宇宙線の影響で冷却されるため"
    ],
    correctAnswer: 1
  },
  {
    question: "流星が燃え尽きるのはどの大気の層ですか？",
    options: [
      "対流圏",
      "成層圏",
      "中間圏",
      "熱圏"
    ],
    correctAnswer: 2
  }
];

const WeatherElements5 = () => {
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
          } else if (data?.completed_units?.includes('weather-elements-3-1')) {
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
                  completed_units: ['weather-elements-3-1']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-elements-3-1')) {
              completedUnits.push('weather-elements-3-1');
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
          description: "風の生成メカニズムの学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">等圧線と風の関係</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！風の生成メカニズムの学習を完了しました。
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
                src="/Weather/Weather2-3-1.html"
                className="w-full h-[600px] border-0"
                title="風の生成メカニズム"
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

export default WeatherElements5