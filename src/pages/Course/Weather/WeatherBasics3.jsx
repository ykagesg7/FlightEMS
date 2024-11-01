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
    question: "高度が上がると大気圧はどのように変化しますか？",
    options: [
      "上昇する",
      "低下する",
      "一定である",
      "日によって変わる"
    ],
    correctAnswer: 1
  },
  {
    question: "海面高度における標準気圧は次のうちどれですか？",
    options: [
      "1,000hPa",
      "995hPa",
      "1,013hPa",
      "1,020hPa"
    ],
    correctAnswer: 2
  },
  {
    question: "標準大気において、気圧が半分になる高度はいくつですか？",
    options: [
      "10,000ft",
      "20,000ft",
      "30,000ft",
      "40,000ft"
    ],
    correctAnswer: 1
  },
  {
    question: "高度計をQNHに設定すると、どのような高度を示しますか？",
    options: [
      "標高ゼロからの高度（真高度）",
      "飛行場の標高からの高度（相対高度）",
      "海面高度からの高度（平均海面高度）",
      "気圧高度からの高度（気圧高度）"
    ],
    correctAnswer: 2
  },
  {
    question: "高度計の設定を誤るとどのような危険がありますか？",
    options: [
      "燃料消費が増える",
      "通信が途絶える",
      "実際の高度と異なる高度を示し、衝突のリスクが高まる",
      "エンジンが停止する"
    ],
    correctAnswer: 2
  },
  {
    question: "標高の高い空港で離陸する際に注意すべき点はどれですか？",
    options: [
      "空気密度が高く、揚力が過剰になる",
      "空気密度が低く、離陸距離が長くなる",
      "気圧が高く、エンジンが過負荷になる",
      "気温が低く、燃料が凍結する"
    ],
    correctAnswer: 1
  },
  {
    question: "気圧高度計が高度を測定する際に利用する原理は何ですか？",
    options: [
      "GPS衛星からの信号",
      "電波高度計による地表面との距離計測",
      "大気圧の変化によるカプセルの変形",
      "気温の変化による膨張収縮"
    ],
    correctAnswer: 2
  },
  {
    question: "高度10,000ftでの標準大気圧はおよそ何hPaですか？",
    options: [
      "1,013hPa",
      "850hPa",
      "700hPa",
      "250hPa"
    ],
    correctAnswer: 2
  },
  {
    question: "高度計設定の「QNE」とは何を意味しますか？",
    options: [
      "現地の気圧に合わせる設定",
      "滑走路面で高度計をゼロに合わせる設定",
      "気圧を1013.25 hPaに設定すること",
      "高度計を使用しない設定"
    ],
    correctAnswer: 2
  },
  {
    question: "高度が増すとエンジン性能が低下する主な理由は何ですか？",
    options: [
      "空気密度が低下し、酸素供給が減少するため",
      "気温が高くなり、エンジンが過熱するため",
      "重力が弱くなり、燃焼効率が落ちるため",
      "風速が増し、エンジンが逆回転するため"
    ],
    correctAnswer: 0
  }
];

const WeatherBasics3 = () => {
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
          } else if (data?.completed_units?.includes('WeatherBasics3')) {
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
                  completed_units: ['WeatherBasics3']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('WeatherBasics3')) {
              completedUnits.push('WeatherBasics3');
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
          description: "気圧と高度の関係の学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">気圧と高度の関係</h1>
      
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
                src="/Weather/Weather1-1-3.html"
                className="w-full h-[600px] border-0"
                title="気圧と高度の関係"
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

export default WeatherBasics3;