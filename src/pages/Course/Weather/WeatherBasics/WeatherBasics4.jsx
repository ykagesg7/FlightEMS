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
    question: "地表付近の大気を構成する最も多い気体はどれですか？",
    options: [
      "酸素（O₂）",
      "窒素（N₂）",
      "アルゴン（Ar）",
      " 二酸化炭素（CO₂）"
    ],
    correctAnswer: 1
  },
  {
    question: "大気中の酸素の体積比率はおよそ何％ですか？",
    options: [
      "約78%",
      "約21%",
      "約0.93%",
      "約0.04%"
    ],
    correctAnswer: 1
  },
  {
    question: "大気中の微量成分で、温室効果ガスとして気候に大きな影響を与えるのはどれですか？",
    options: [
      "酸素（O₂）",
      "窒素（N₂）",
      "アルゴン（Ar）",
      " 二酸化炭素（CO₂）"
    ],
    correctAnswer: 3
  },
  {
    question: "水蒸気が大気中に含まれる最大の割合は約何％ですか？",
    options: [
      "約1%",
      "約2%",
      "約4%",
      "約10%"
    ],
    correctAnswer: 2
  },
  {
    question: "高度約36,000ftまでの対流圏内で、大気の主な成分の割合はどのようになりますか？",
    options: [
      "高度とともに大きく変化する",
      "高度とともに減少する",
      "ほぼ一定である",
      "高度とともに増加する"
    ],
    correctAnswer: 2
  },
  {
    question: "高高度で酸素マスクが必要となる理由は何ですか？",
    options: [
      "酸素の割合が低下するため",
      "気圧の低下により酸素の分圧が低下するため",
      "二酸化炭素濃度が上昇するため",
      "窒素が不足するため"
    ],
    correctAnswer: 1
  },
  {
    question: "次のうち、不活性ガスであり、大気中に約0.93%含まれるのはどれですか？",
    options: [
      "ヘリウム（He）",
      "ネオン（Ne）",
      "アルゴン（Ar）",
      "キセノン（Xe）"
    ],
    correctAnswer: 2
  },
  {
    question: "大気中の窒素が生物の利用可能な形になる過程を何といいますか？",
    options: [
      "窒素循環",
      "窒素固定",
      "光合成",
      "蒸発"
    ],
    correctAnswer: 1
  },
  {
    question: "対流圏よりも高高度では、大気の成分の割合が変化する主な理由は何ですか？",
    options: [
      "温度の上昇による化学反応の促進",
      "重力による分子量の違いによる成分分離",
      "太陽風による成分の吹き飛ばし",
      "地球の磁場の影響"
    ],
    correctAnswer: 1
  },
  {
    question: "航空機の排出が地球温暖化に影響を与える主な理由は何ですか？",
    options: [
      "窒素の排出による大気汚染",
      "大量の酸素を消費するため",
      "二酸化炭素の排出による温室効果ガスの増加",
      "アルゴンの放出による気候変動"
    ],
    correctAnswer: 2
  }
];

const WeatherBasics4 = () => {
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
          } else if (data?.completed_units?.includes('weather-basics-2-1')) {
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
                  completed_units: ['weather-basics-2-1']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-basics-2-1')) {
              completedUnits.push('weather-basics-2-1');
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
          description: "大気の層とその特徴の学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">大気の主な成分</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！大気の主な成分の学習を完了しました。
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
                src="/Weather/Weather1-2-1.html"
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

export default WeatherBasics4;