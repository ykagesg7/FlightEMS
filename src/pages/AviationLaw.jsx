import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Book, List, Scale, RefreshCcw } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';

const AviationLawPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        checkCompletionStatus(user.id);
      }
    };
    fetchUser();
  }, []);

  const checkCompletionStatus = async (userId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('completed')
      .eq('user_id', userId)
      .eq('section', 'aviation_law')
      .single();

    if (error) {
      console.error('Error checking completion status:', error);
    } else if (data && data.completed) {
      setTestCompleted(true);
    }
  };

  const sections = [
    {
      title: "1. シカゴ条約の概要",
      icon: <Book className="w-6 h-6" />,
      content: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              1.1 ICAOの設立と目的
            </AccordionTrigger>
            <AccordionContent>
             <p className="mb-2">シカゴ条約は、国際民間航空の基本的な枠組みを定めた重要な条約です。以下のストーリーを通じて、その概要と重要性を学びましょう。</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              1.2 シカゴ条約の誕生
            </AccordionTrigger>
            <AccordionContent>
              <img src="/ChicagoTreaty.jpg" alt="シカゴ条約のイメージ" className="w-full h-auto rounded-lg shadow-md" />
              <p className="mb-2">「藤木、今日はシカゴ条約について学ぶぞ」教官である飛鳥の声には、厳しさの中に温かみが感じられた。</p>
              <p className="mb-2">「はい！」パイロット学生の藤木は背筋を伸ばして答えた。彼の目には、知識を吸収しようとする熱意が宿っていた。</p>
              <p className="mb-2">飛鳥は窓際に立ち、遠くを見つめながら語り始めた。「シカゴ条約、正式名称を国際民間航空条約という。1944年12月7日、第二次世界大戦の終結が見えてきた頃に採択された。連合国と中立国52カ国が、戦後の国際民間航空の秩序を確立するために締結したんだ」</p>
              <p className="mb-2">藤木は熱心にメモを取り始めた。ペンを走らせる音だけが、静かな教室に響いていた。</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              1.3 シカゴ条約の主な内容
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">「条約の主な内容は4つ」飛鳥は藤木の方に向き直り、指を折りながら説明した。</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>締約国の領空主権の承認</li>
                <li>民間航空機のみに適用</li>
                <li>出入国規制や航空機の登録などの規定</li>
                <li>国際航空運送を円滑にする措置の規定</li>
              </ol>
              <p className="mt-2">「特に重要なのは、各国の領空に対する完全かつ排他的な主権の承認だな」</p>
              <img src="/ICAO.png" alt="ICAOのイメージ" className="w-full h-auto rounded-lg shadow-md" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    },
    {
      title: "2. ICAOの役割と機能",
      icon: <List className="w-6 h-6" />,
      content: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>2.1 ICAOの設立と目的</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">「ICAOについても教えていただけますか？」藤木が質問した。</p>
              <p className="mb-2">飛鳥は微笑んだ。「よく知っているな。ICAOは国際民間航空機関の略称だ。シカゴ条約に基づいて設立された国連の専門機関で、世界の民間航空の安全性や効率性を高めるために活動している。航空に関する国際標準や推奨方式を定めているんだ」</p>
              <p className="mb-2">ICAOの主な目的は以下の通りです：</p>
              <ul className="list-disc list-inside space-y-2">
                <li>国際民間航空の安全で秩序ある発展を確保すること</li>
                <li>平和的目的のための航空機の設計と運航を奨励すること</li>
                <li>国際民間航空のための航空路、空港、航空施設の発展を奨励すること</li>
                <li>世界の人々の安全で、規則的で、効率的で経済的な航空輸送の需要に応えること</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2.2 ICAOの活動内容</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">ICAOは、国際民間航空の安全性と効率性を高めるために、以下のような活動を行っています：</p>
              <ul className="list-disc list-inside space-y-2">
                <li>国際標準及び推奨方式（SARPs）の策定と更新</li>
                <li>航空安全監査の実施</li>
                <li>航空保安対策の強化</li>
                <li>環境保護に関する取り組み</li>
                <li>航空事故調査の支援</li>
                <li>航空従事者の育成支援</li>
              </ul>
              <p className="mt-2">「例えば、2014年のマレーシア航空370便墜落事故後、外洋上を飛行する旅客機の位置情報送信に関する新たな基準が採用されたんだ」と飛鳥3佐は具体例を挙げて説明した。</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    },
    {
      title: "3. 日本とシカゴ条約",
      icon: <Scale className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg">「日本はこの条約にどう関わっているんですか？」藤木2曹が尋ねた。</p>
          <p className="text-lg">「日本は1953年に61番目の加盟国として参加し、56年には理事国に選出された。日本の航空法の多くが、ICAOの基準に基づいて作られているんだよ」と飛鳥3佐は答えた。</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>日本の加盟：</strong> 1953年に61番目の加盟国として参加</li>
            <li><strong>理事国選出：</strong> 1956年に理事国に選出</li>
            <li><strong>国内法への影響：</strong> 日本の航空法の多くがICAOの基準に基づいて制定</li>
            <li><strong>国際協力：</strong> 航空安全や環境保護などの分野で国際的な取り組みに参加</li>
          </ul>
          <img src="/japan-icao.jpg" alt="日本とICAOの関係図" className="w-full h-auto rounded-lg shadow-md" />
        </div>
      )
    },
    {
      title: "4. まとめ：シカゴ条約とICAOの重要性",
      icon: <RefreshCcw className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg">シカゴ条約とICAOがもたらすもの：</p>
          <ul className="list-disc list-inside space-y-2">
            <li>国際航空の基本的な枠組みの提供</li>
            <li>世界中の航空機の安全な運航の実現</li>
            <li>国際的な航空標準の統一</li>
            <li>航空技術の発展と環境保護の促進</li>
          </ul>
          <p className="text-lg font-semibold">飛鳥3佐の言葉：「国際社会で活動する以上、こういった枠組みを理解し、尊重することが重要だ。これからのパイロットとして、しっかり身につけろよ」</p>
        </div>
      )
    }
  ];

  const comprehensionTest = [
    {
      question: "シカゴ条約の正式名称は何ですか？",
      options: [
        "国際航空安全条約",
        "国際民間航空条約",
        "世界航空機関設立条約",
        "航空自由化条約"
      ],
      correctAnswer: 1
    },
    {
      question: "ICAOの主な目的は何ですか？",
      options: [
        "軍事航空の発展",
        "航空会社の利益増大",
        "国際民間航空の安全で秩序ある発展",
        "航空機の速度向上"
      ],
      correctAnswer: 2
    },
    {
      question: "日本がシカゴ条約に加盟した年は？",
      options: [
        "1944年",
        "1953年",
        "1956年",
        "1960年"
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
      
      // Update Supabase
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({ 
          user_id: user.id,
          section: 'aviation_law',
          completed: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating progress:', error);
        toast({
          title: "エラー",
          description: "進捗の更新中にエラーが発生しました。",
          variant: "destructive",
        });
      } else {
        toast({
          title: "おめでとうございます！",
          description: "航空法規セクションを完了しました。",
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {user ? (
        <>
          <h1 className="text-3xl font-bold mb-2">航空法規 - シカゴ条約とICAO</h1>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">学習目標</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>シカゴ条約の概要と重要性を理解する。</li>
              <li>ICAOの役割と機能を理解する。</li>
              <li>日本の航空法規との関連を理解する。</li>
            </ol>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader 
                  className="flex items-center cursor-pointer" 
                  onClick={() => setActiveSection(activeSection === index ? null : index)}
                >
                  {section.icon}
                  <h2 className="text-xl font-semibold ml-2">{section.title}</h2>
                </CardHeader>
                {activeSection === index && (
                  
                  <CardContent>
                    {section.content}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          {!testCompleted && (
            <Button onClick={() => setShowTest(true)} className="mt-4">
              理解度テストを受ける
            </Button>
          )}
          {showTest && !testCompleted && (
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-2xl font-bold">理解度テスト</h2>
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
          )}
          {testCompleted && (
            <Card className="mt-6 bg-green-100">
              <CardContent>
                <p className="text-lg font-semibold text-green-800">
                  おめでとうございます！航空法規セクションを完了しました。
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-xl">ログインが必要です。</p>
          <Button onClick={() => { /* Implement login logic */ }} className="mt-4">
            ログイン
          </Button>
        </div>
      )}
    </div>
  );
};

export default AviationLawPage;