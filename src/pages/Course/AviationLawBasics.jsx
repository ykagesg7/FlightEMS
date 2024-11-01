import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AviationLawBasics = () => {
  const [user, setUser] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCompleted, setTestCompleted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await checkCompletionStatus(user.id);
      }
    };
    fetchUser();
  }, []);

  const checkCompletionStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('unlocked_units')
        .eq('user_id', userId)
        .eq('section', 'aviation-law')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('User has not started this section yet');
          return;
        }
        console.error('Error checking completion status:', error);
        toast({
          title: "エラー",
          description: "進捗状況の確認中にエラーが発生しました。",
          variant: "destructive",
        });
      } else if (data && data.unlocked_units && data.unlocked_units['aviation-law'] && data.unlocked_units['aviation-law'][1]) {
        setTestCompleted(true);
      }
    } catch (error) {
      console.error('Unexpected error in checkCompletionStatus:', error);
      toast({
        title: "エラー",
        description: "予期せぬエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  const comprehensionTest = [
    {
      question: "航空法の主な目的は何ですか？",
      options: [
        "航空機の性能向上",
        "航空事業者の利益増大",
        "航空の安全と秩序の維持",
        "航空券の価格規制"
      ],
      correctAnswer: 2
    },
    {
      question: "航空法における「航空機」の定義は何ですか？",
      options: [
        "地上を移動する全ての乗り物",
        "人が乗ることができる飛行機のみ",
        "人が乗ることができ、飛行することができる機器",
        "自動操縦が可能な飛行機のみ"
      ],
      correctAnswer: 2
    },
    {
      question: "航空法に基づく航空機の登録制度の目的は何ですか？",
      options: [
        "航空機の所有者を明確にするため",
        "航空機の税金を徴収するため",
        "航空機の性能を評価するため",
        "航空機の製造者を管理するため"
      ],
      correctAnswer: 0
    },
    {
      question: "航空従事者技能証明制度の主な目的は何ですか？",
      options: [
        "航空機の設計能力を証明するため",
        "航空機の操縦や整備に必要な能力を証明するため",
        "航空会社の経営能力を証明するため",
        "航空機の製造技術を証明するため"
      ],
      correctAnswer: 1
    },
    {
      question: "航空法における「空港」の定義は何ですか？",
      options: [
        "航空機の離着陸のみに使用される場所",
        "航空機の駐機のみに使用される場所",
        "航空機の離着陸及び航空旅客の乗降等に使用される場所",
        "航空機の整備のみに使用される場所"
      ],
      correctAnswer: 2
    },
    {
      question: "航空法に基づく航空路の指定の目的は何ですか？",
      options: [
        "航空機の燃料消費を最小限に抑えるため",
        "航空機の運航を効率的に管理するため",
        "航空機の速度を最大化するため",
        "航空機の乗客数を増やすため"
      ],
      correctAnswer: 1
    },
    {
      question: "航空法における「航空交通管制」の主な目的は何ですか？",
      options: [
        "航空機の速度を制限すること",
        "航空機の衝突を防止し、航空交通の秩序ある流れを維持すること",
        "航空機の乗客数を管理すること",
        "航空機の燃料消費を監視すること"
      ],
      correctAnswer: 1
    },
    {
      question: "航空法に基づく航空機の耐空証明の目的は何ですか？",
      options: [
        "航空機の所有者を証明すること",
        "航空機の製造年を証明すること",
        "航空機が安全に飛行できる状態にあることを証明すること",
        "航空機の経済性を証明すること"
      ],
      correctAnswer: 2
    },
    {
      question: "航空法における「航空障害灯」の設置目的は何ですか？",
      options: [
        "夜間に建物を装飾するため",
        "航空機の離着陸を補助するため",
        "高層建築物等の存在を航空機に示すため",
        "地上の人々に航空機の位置を知らせるため"
      ],
      correctAnswer: 2
    },
    {
      question: "航空法に基づく飛行計画の提出が必要な理由は何ですか？",
      options: [
        "航空機の燃料消費量を計算するため",
        "航空機の運航を効率的に管理し、安全を確保するため",
        "航空機の乗客数を管理するため",
        "航空機の速度を制限するため"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    });
  };

  const handleTestSubmit = async () => {
    if (!user) {
      toast({
        title: "エラー",
        description: "ユーザー認証が必要です。",
        variant: "destructive",
      });
      return;
    }

    const score = comprehensionTest.reduce((acc, question, index) => {
      return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const passed = score === comprehensionTest.length;

    if (passed) {
      setTestCompleted(true);
      
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('unlocked_units')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching unlocked units:', error);
          toast({
            title: "エラー",
            description: "進捗の更新中にエラーが発生しました。",
            variant: "destructive",
          });
          return;
        }

        const unlockedUnits = data?.unlocked_units || {};
        if (!unlockedUnits['aviation-law']) {
          unlockedUnits['aviation-law'] = [];
        }
        unlockedUnits['aviation-law'][1] = true;

        const { error: updateError } = await supabase
          .from('user_progress')
          .upsert({ 
            user_id: user.id,
            unlocked_units: unlockedUnits
          });

        if (updateError) {
          console.error('Error updating progress:', updateError);
          toast({
            title: "エラー",
            description: "進捗の更新中にエラーが発生しました。",
            variant: "destructive",
          });
        } else {
          toast({
            title: "おめでとうございます！",
            description: "航空法の基礎を完了しました。次の単元が解放されました。",
          });
        }
      } catch (error) {
        console.error('Unexpected error in handleTestSubmit:', error);
        toast({
          title: "エラー",
          description: "予期せぬエラーが発生しました。",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "もう一度挑戦してください",
        description: `正解数: ${score}/${comprehensionTest.length}`,
        variant: "destructive",
      });
    }
  };
    

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">航空法の基礎</h1>
      
      {!testCompleted ? (
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
            <Button onClick={handleTestSubmit} className="mt-4">
              テストを提出
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-lg font-semibold text-green-600">
              おめでとうございます！航空法の基礎を完了しました。
            </p>
            <Button onClick={() => navigate('/course')} className="mt-4">
              コース一覧に戻る
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
    
export default AviationLawBasics;