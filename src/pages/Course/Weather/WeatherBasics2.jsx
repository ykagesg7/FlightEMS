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
    question: "トロポポーズはどの大気の層とどの大気の層の間にありますか？",
    options: [
      "成層圏と中間圏",
      "対流圏と成層圏",
      "中間圏と熱圏",
      "熱圏と外気圏"
    ],
    correctAnswer: 1
  },
  {
    question: "トロポポーズ付近で起こりやすい現象はどれですか？",
    options: [
      "強い対流活動",
      "オーロラの発生",
      "ジェット気流の発生",
      "流星の燃焼"
    ],
    correctAnswer: 2
  },
  {
    question: "トロポポーズの高度が最も高くなるのはどの場所ですか？",
    options: [
      "赤道付近",
      "中緯度地域",
      "極地付近",
      "砂漠地帯"
    ],
    correctAnswer: 0
  },
  {
    question: "トロポポーズでの温度変化の特徴は何ですか？",
    options: [
      "温度が急激に上昇する",
      "温度が急激に低下する",
      "温度が一定もしくはわずかに上昇に転じる",
      "温度が大きく変動する"
    ],
    correctAnswer: 2
  },
  {
    question: "ジェット旅客機がトロポポーズ付近を巡航する主な理由は何ですか？",
    options: [
      "気象現象が多いので刺激的な飛行ができる",
      "燃費効率が良く、安定した飛行が可能だから",
      "地表からの景色がよく見えるから",
      "通信信号が強く受信できるから"
    ],
    correctAnswer: 1
  },
  {
    question: "トロポポーズの高度が季節によって変動する理由は何ですか？",
    options: [
      "太陽活動の強弱による",
      "地球の公転速度の変化による",
      "気温分布の変化に伴う対流活動の変化による",
      "月の引力の影響による"
    ],
    correctAnswer: 2
  },
  {
    question: "トロポポーズ付近で注意が必要な気象現象はどれですか？",
    options: [
      "台風",
      "着氷",
      "晴天乱気流(CAT)",
      "霧"
    ],
    correctAnswer: 2
  },
  {
    question: "トロポポーズを特定するために用いられる主な観測手段はどれですか？",
    options: [
      "気象衛星観測",
      "地上天気図の解析",
      "ラジオゾンデによる高層気象観測",
      "海洋ブイのデータ収集"
    ],
    correctAnswer: 2
  },
  {
    question: "次のうち、トロポポーズの特徴として正しいものはどれですか？",
    options: [
      "大気が非常に不安定である",
      "大気中のオゾン濃度が急減する",
      "温度減率がゼロまたは逆転する",
      "大気密度が最大となる"
    ],
    correctAnswer: 2
  },
  {
    question: "トロポポーズ付近のジェット気流を利用することで得られる利点は何ですか？",
    options: [
      "航空機の速度を落として燃費を節約できる",
      "向かい風を受けて安定した飛行ができる",
      "追い風を利用して飛行時間を短縮できる",
      "上昇気流を利用して高度を上げられる"
    ],
    correctAnswer: 2
  }
];

const WeatherBasics2 = () => {
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
          } else if (data?.completed_units?.includes('WeatherBasics2')) {
            setTestCompleted(true);
          }
        }
      } catch (error) {
        console.error('Error checking completion status:', error);
        await toast({
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
                  completed_units: ['WeatherBasics2']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('WeatherBasics2')) {
              completedUnits.push('WeatherBasics2');
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
          description: "トロポポーズの役割の学習を完了しました。",
        });
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
      <h1 className="text-3xl font-bold mb-8">トロポポーズの役割</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！トロポポーズの役割の学習を完了しました。
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="slides">学習内容</TabsTrigger>
          <TabsTrigger value="test">理解度テスト</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slides">
          <Card>
            <CardHeader>
              <CardTitle>スライドプレゼンテーション</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src="/Weather/Weather1-1-2.html"
                className="w-full h-[600px] border-0"
                title="トロポポーズの役割"
              />
            </CardContent>
          </Card>
        </TabsContent>

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

export default WeatherBasics2;