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
    question: "高度が上がると気圧はどのように変化しますか？",
    options: [
      "増加する",
      "減少する",
      "一定である",
      "変化しない"
    ],
    correctAnswer: 1
  },
  {
    question: "標準大気における海面上の気圧は次のうちどれですか？",
    options: [
      "1000 hPa",
      "1013.25 hPa",
      "1020 hPa",
      " 980 hPa"
    ],
    correctAnswer: 1
  },
  {
    question: "気圧高度とは何を示しますか？",
    options: [
      "実際の地形の高さ",
      "気圧計で測定した圧力に対応する高度",
      "気温補正後の高度",
      "海抜高度"
    ],
    correctAnswer: 1
  },
  {
    question: "高度計におけるQNH設定とは何ですか？",
    options: [
      "離陸・着陸空港の標高を設定すること",
      "海面上の気圧を設定すること",
      "目的地の気圧を設定すること",
      "高度計をゼロに合わせること"
    ],
    correctAnswer: 1
  },
  {
    question: "高度計の誤差要因として正しくないものはどれですか？",
    options: [
      "気温の変化",
      "気圧の変化",
      "湿度の変化",
      "航空機の速度"
    ],
    correctAnswer: 3
  },
  {
    question: "気温が標準大気より高い場合、実際の高度は高度計指示よりもどうなりますか？",
    options: [
      "高くなる",
      "低くなる",
      "同じである",
      "不定である"
    ],
    correctAnswer: 1
  },
  {
    question: "密度高度が高くなる(空気密度が低くなる)条件として正しいものはどれですか？",
    options: [
      "高気圧で低温のとき",
      "低気圧で高温のとき",
      "高気圧で高温のとき",
      "低気圧で低温のとき"
    ],
    correctAnswer: 1
  },
  {
    question: "密度高度が高くなると航空機の性能はどうなりますか？",
    options: [
      "向上する",
      "変化しない",
      "低下する",
      "安定する"
    ],
    correctAnswer: 2
  },
  {
    question: "高度計の設定でQFEを使用すると、地上で高度計は何を示しますか？",
    options: [
      "海抜高度",
      "離陸空港の標高",
      "高度ゼロ",
      "目的地の標高"
    ],
    correctAnswer: 2
  },
  {
    question: "飛行中に適切な高度を維持するために、パイロットが行うべき重要なことは何ですか？",
    options: [
      "高度計の気圧設定を更新する",
      "エンジン出力を最大にする",
      "燃料消費を抑える",
      "進路を頻繁に変更する"
    ],
    correctAnswer: 0
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