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
    question: "高温時に大気密度が低下すると航空機の揚力はどうなりますか？",
    options: [
      "増加する",
      "減少する",
      "変化しない",
      "不定である"
    ],
    correctAnswer: 1
  },
  {
    question: "気温が高くなるとエンジン出力は一般的にどうなりますか？",
    options: [
      "向上する",
      "減少する",
      "変化しない",
      "不定である"
    ],
    correctAnswer: 1
  },
  {
    question: "高温時に離陸滑走距離が延長する主な理由は何ですか？",
    options: [
      "エンジン出力の向上",
      "大気密度の増加",
      "大気密度の低下による揚力不足",
      "機体重量の減少"
    ],
    correctAnswer: 2
  },
  {
    question: "低温時にキャブレター氷結のリスクが高まるのはなぜですか？",
    options: [
      "空気中の水分が減少するため",
      "空気の温度が氷点下になるため",
      "燃料の温度が上昇するため",
      "空気の膨張による冷却効果が大きくなるため"
    ],
    correctAnswer: 3
  },
  {
    question: "揚力の公式において、気温上昇により減少する要素はどれですか？",
    options: [
      "翼面積(S)",
      "対気速度(V)",
      "大気密度(ρ)",
      "揚力係数(CL)"
    ],
    correctAnswer: 2
  },
  {
    question: "高高度飛行時にマッハ数制限に注意が必要になる理由は何ですか？",
    options: [
      "気温低下でエンジン出力が増加するため",
      "音速が低下し、同じ速度でもマッハ数が増加するため",
      "機体の重量が増加するため",
      "大気密度が増加し、抗力が減少するため"
    ],
    correctAnswer: 1
  },
  {
    question: "低温時に揚力が増加するために起こり得る問題は何ですか？",
    options: [
      "離陸滑走距離の延長",
      "エンジンの過熱",
      "エンジン推力の増加による着陸滑走距離の延伸",
      "ブレーキ性能の低下"
    ],
    correctAnswer: 2
  },
  {
    question: "高温環境でエンジンや機体の冷却が難しくなる主な理由は何ですか？",
    options: [
      "燃料が蒸発しやすくなるため",
      "空気中の水分量が減少するため",
      "空気が暖かく、放熱効果が低下するため",
      "空気の流れが速くなるため"
    ],
    correctAnswer: 2
  },
  {
    question: "高温・高密度高度条件下でパイロットが取るべき対策として適切でないものはどれですか？",
    options: [
      "機体重量を制限する",
      "涼しい時間帯に離陸する",
      "離陸滑走路を長いものに変更する",
      "エンジン出力を抑える"
    ],
    correctAnswer: 3
  },
  {
    question: "気温が航空機に与える影響として正しくないものはどれですか？",
    options: [
      "気温上昇で大気密度が低下し、揚力が減少する",
      "気温低下でエンジン出力が向上する",
      "気温上昇で抗力が増加する",
      "気温低下で空気抵抗が増加する"
    ],
    correctAnswer: 2
  }
];

const WeatherElements1 = () => {
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
          } else if (data?.completed_units?.includes('weather-elements-1-1')) {
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
                  completed_units: ['weather-elements-1-1']
                });
            } else {
              throw error;
            }
          } else {
            const completedUnits = data.completed_units || [];
            if (!completedUnits.includes('weather-elements-1-1')) {
              completedUnits.push('weather-elements-1-1');
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
          description: "気温の変化が航空機に与える影響の学習を完了しました。",
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
      <h1 className="text-3xl font-bold mb-8">気温の変化が航空機に与える影響</h1>
      
      {testCompleted && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-lg font-semibold text-green-600 mb-4">
              おめでとうございます！気温の変化が航空機に与える影響の学習を完了しました。
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
                src="/Weather/Weather2-1-1.html"
                className="w-full h-[600px] border-0"
                title="気温の変化が航空機に与える影響"
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

export default WeatherElements1;