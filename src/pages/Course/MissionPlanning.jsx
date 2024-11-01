import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Info, List, Briefcase, RefreshCcw } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';

const MissionPlanningPage = () => {
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
      .eq('section', 'mission_planning')
      .single();

    if (error) {
      console.error('Error checking completion status:', error);
    } else if (data && data.completed) {
      setTestCompleted(true);
    }
  };

  const sections = [
    {
      title: "1. Mission Planningの重要性",
      icon: <Info className="w-6 h-6" />,
      content: (
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-4">
            <p className="text-lg">Mission Planningは、膨大な情報を収集整理し、多様な状況への対応策を考えなければならない、手間のかかる作業です。それでもMission Planningを行わなければならない理由は何でしょうか？</p>
            <p className="text-lg">まずは、以下の物語を読んでみましょう。</p>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-2">プロローグ：熟練パイロット、飛鳥の重圧</h3>
                <p className="mb-2">「飛鳥さん、また徹夜ですか？少しは休まないと体がもちませんよ。」</p>
                <p className="mb-2">飛鳥のデスクは、作戦エリアの航空写真、気象データ、そして敵部隊の予想行動パターンを示す図表などの資料で埋め尽くされていた。彼の鋭い視線は、まるで獲物を狙う鷹のように、それらの資料の一つ一つを丹念に追っていた。</p>
                <p className="mb-2">「大丈夫だ、健太。今回の作戦はいつも以上に重要だ。万全の準備をしなければ、隊員たちの命を危険に晒すことになる。」</p>
                <p className="mb-2">飛鳥は、少し疲れた様子を見せながらも、力強い口調で答えた。彼の視線の先にあるのは、燃料計算や夜間飛行計画など、複雑に絡み合った要素を考慮した上で緻密に練り上げられたMission Planningの結果だった。</p>
                <p className="mb-2">「確かに、敵の迫撃砲部隊は厄介な位置に陣取っています。少しでも油断すれば、こちらに大損害を与える可能性もある。」</p>
                <p>健太は、飛鳥の言葉に深く頷いた。二人は対照的な性格だが、お互いに認め合い、信頼し合っている。飛鳥の卓越した計画性と、健太の類まれな操縦技術。二人の力は、どんな困難をも乗り越えるために不可欠なものだった。</p>
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-2">綿密な計画が生む勝利</h3>
                <p className="mb-2">「今回の作戦目標は、敵迫撃砲陣地の制圧だ。情報によると、規模は3個小隊程度と推測される。」</p>
                <p className="mb-2">ブリーフィングルームのスクリーンに、作戦エリア周辺の地図が映し出される。飛鳥は、その場に集まったパイロットたちに向かって、鋭い視線を向けながら説明を続ける。</p>
                <p className="mb-2">「敵防空網は未確認だが、携行式SAMによる攻撃のリスクは否定できない。油断は禁物だ。」</p>
                <p className="mb-2">飛鳥は、テーブルに置かれた資料に目を落とす。そこには、FACから送られてきたばかりの最新情報や、地形、天候、敵の予想行動など、あらゆる要素を考慮した綿密なMission Planningの結果が記されていた。</p>
                <p className="mb-2">「攻撃経路は、敵の視界を避けるため地形の起伏を利用した低空飛行が有効と考えられる。低空飛行では、迅速な判断と正確な操縦が求められるため、入念なルートプランニングが不可欠だ。」</p>
                <p className="mb-2">「飛鳥さん。今回の作戦は低空飛行になる分、燃料消費が心配です。安全に帰還できるだけの燃料は確保できるのでしょうか？」</p>
                <p className="mb-2">若手パイロットの質問に、飛鳥は静かに頷く。</p>
                <p className="mb-2">「もちろんだ。想定される飛行時間と燃料消費量を事前に計算し、緊急事態発生時の対応も考慮した上で、安全マージンを十分に確保した飛行計画を立てている。代替任務への切り替えや、緊急着陸地点の選定も済んでいる。安心してくれ。」</p>
                <p className="mb-2">飛鳥は、経験に裏打ちされた確かな知識と、冷静沈着な判断力で、あらゆる事態を想定し、任務の達成と搭乗員の安全を最優先に考えた完璧なMission Planningを立案していた。それは、事前の綿密な計画が、任務の成功と安全確保に不可欠であるという原則を体現していた。</p>
                <p className="mb-2">「我々は、状況に応じて柔軟に対応し、任務を完遂しなければならない。しかし、安全を最優先に考え、状況判断に迷う場合は、直ちに報告すること。いいな？」</p>
                <p className="mb-2">「了解！！」</p>
                <p>飛鳥の言葉に、パイロットたちの表情が引き締まる。彼らの胸には、緊張感とともに、飛鳥への厚い信頼感が宿っていた。</p>
              </section>
            </div>
            <img src="/briefing.jpg" alt="ブリーフィングのイメージ" className="w-full h-auto rounded-lg shadow-md" />
          </div>
        </ScrollArea>
      )
    },
    {
      title: "2. Mission Planningのプロセス",
      icon: <List className="w-6 h-6" />,
      content: (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>2.1 任務の分析</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">任務の分析は、Mission Planningの最初のステップであり、作戦の成否を大きく左右する重要なプロセスです。この段階では、<b><i>作戦目標を明確化（Why to do？）</i></b>し、<b><i>その達成に必要な情報を精査（What to do？）</i></b>することから始めます。</p>
              <p className="mb-2">今回のストーリーでは、「敵迫撃砲陣地の制圧」という作戦目標が設定されています。この目標を達成するためには、敵迫撃砲陣地の位置、規模、防御体制、周辺環境、味方部隊の状況など、様々な要素を考慮する必要があります。</p>
              <p className="mb-2">ストーリーからは、任務分析において以下の教訓が得られます。</p>
              <ul className="mb-2">
                <li>１　目標の明確化</li>
                  <p className="mb-2">「敵迫撃砲陣地の制圧」という明確な目標設定が、その後の綿密な計画に繋がっています。目標が曖昧なままでは、適切な計画を立てることはできません。</p>
                <li>２　必要な情報の特定</li>
                  <p className="mb-2">任務の達成には、敵の戦力や配置、地形、天候など、様々な情報が不可欠になります。任務分析の段階で、どのような情報が必要になるのかを明確にすることが重要です。</p>
                <li>３　時間的制約</li>
                  <p className="mb-2">膨大な情報をすべて収集・分析する時間的余裕はありません。しかし限られた時間の中で、任務達成のために必要な情報を取捨選択する必要があります。</p>
              </ul>
              <p className="mb-2">結論として、任務分析では、限られた時間の中で、目標を明確化し、必要な情報を特定する能力が求められます。 このプロセスを疎かにすると、その後の計画に悪影響を及ぼし、ミッションの成功を危うくする可能性があります。</p>
              <img src="/preplan.jpg" alt="任務分析のイメージ" className="w-full h-auto rounded-lg shadow-md" />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2.2 情報収集</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">情報収集は、任務分析と同じく重要なプロセスです。 正確な情報に基づいて計画を立てないと、ミッションの成功はおろか、搭乗員の安全を脅かす可能性すらあります。</p>
              <p className="mb-2">ストーリーでは、飛鳥はFAC（前線航空統制官）から提供された最新情報を含む様々な資料を元にMission Planningを行っており、以下の教訓が得られます。</p>
              <ul className="mb-2">
                <li>１　最新情報の重要性</li>
                  <p className="mb-2">特に敵に関する情報は刻一刻と変化する可能性があり、FACからの最新情報の入手と分析は、ミッションの成否を大きく左右します。</p>
                <li>２　多様な情報源の活用</li>
                  <p className="mb-2">ストーリーでは航空写真、気象データ、敵部隊の予想行動パターンを示す図表などが登場します。成功のためには、これらの情報源に加え、地形、天候、敵の装備や戦術など、多岐にわたる情報を収集し、分析する必要があります。</p>
                <li>３　時間的制約</li>
                  <p className="mb-2">ストーリーでは、飛鳥は膨大な量の情報を分析していましたが、時間的制約があることが示されています。情報収集の段階で、本当に必要な情報は何かを見極める能力が重要になります。</p>
              </ul>
              <p className="mb-2">結論として、情報収集は任務の分析結果に基づき、必要な情報を効率的に集め、分析することが重要です。 特に、時間的制約がある状況下では、情報収集の優先順位を決め、限られた時間内で最大限の情報を収集する必要があります。
              </p>
              <img src="/analyzing.jpg" alt="情報分析のイメージ" className="w-full h-auto rounded-lg shadow-md" />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>2.3 計画の作成</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">Mission Planningは、時間と労力を要する作業ですが、ストーリーで示されたように、任務の成功と安全確保、そして信頼獲得のために不可欠です。特に、ストーリー後半のブリーフィング場面からは、以下の教訓を導き出すことができます。</p>
              <ul className="mb-2">
                <li>１　明確な目標設定</li>
                  <p className="mb-2">飛鳥は「敵迫撃砲陣地の制圧」という明確な目標をパイロットたちに示しています。任務の分析でも述べましたが、まず目標を明確にすることが、その後の綿密な計画、ひいては任務成功へと繋がります。</p>
                <li>２　徹底的な情報収集と分析</li>
                  <p className="mb-2">飛鳥は、作戦エリアの航空写真、気象データ、敵部隊の予想行動パターンなど、膨大な情報を収集し、分析しています。このように任務の達成には、敵の戦力や配置、地形、天候など、様々な情報を基にした計画の作成が不可欠です。</p>
                <li>３　あらゆる事態の想定と対応策</li>
                  <p className="mb-2">飛鳥は、燃料消費、緊急事態発生時の対応、代替任務への切り替え、緊急着陸地点など、あらゆる事態を想定し、対応策を計画に組み込んでいます。これは、「多様な状況への対応策」を具体的に示した例と言えるでしょう。</p>
              </ul>
              <p className="mb-2">結論として、任務の分析結果に基づき必要な情報を効率的に収集・分析し、それに基づいて綿密に計画と準備を行うことが、困難な任務を成功させ、搭乗員の命を守るために不可欠なのです。</p>
              <img src="/planning.jpg" alt="情報分析のイメージ" className="w-full h-auto rounded-lg shadow-md" />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>2.4 ブリーフィング</AccordionTrigger>
            <AccordionContent>
            <p className="mb-2">ブリーフィングの内容と、ブリーフィングの実施方法の観点から、ブリーフィングを行う上での教訓を見ていきましょう。</p>
              <ul className="mb-2">
                <li>１　目標の明確な伝達</li>
                  <p className="mb-2">ブリーフィングでは、任務目標を明確かつ簡潔に伝えることが重要です。ストーリーでは、「敵迫撃砲陣地の制圧」という明確な目標設定が、綿密な計画に繋がっています。訓練においてもこれは同様であり、訓練目標が曖昧なままでは、具体的な行動を計画できません。</p>
                <li>２　必要な情報の網羅性</li>
                  <p className="mb-2">任務の達成に必要な情報は、敵の戦力や配置、地形、天候など多岐にわたります。ブリーフィングでは、これらの情報を網羅的に提供することで、参加者の状況認識を高める必要があります。特に、時間的制約がある場合は、重要な情報を優先的に伝えることが重要です。</p>
                <li>３　時間管理</li>
                  <p className="mb-2">ブリーフィングは、限られた時間内で行われなければなりません。そのため、事前に内容を整理し、時間配分を考慮することが重要です。</p>
              </ul>
              <img src="/massbriefing.jpg" alt="ブリーフィングのイメージ" className="w-full h-auto rounded-lg shadow-md" />
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      )
    },
    {
      title: "3. Mission Planningで考慮すべき重要事項",
      icon: <Briefcase className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <ul className="list-disc list-inside space-y-2">
            <li><strong>安全確保</strong>：リスク評価と軽減策、緊急時の対応手順</li>
            <li><strong>効率性</strong>：時間、燃料、資源の効率的な活用</li>
            <li><strong>柔軟性</strong>：予期せぬ事態への対応、代替計画</li>
            <li><strong>CRM（クルー・リソース・マネジメント）</strong>：コミュニケーション、状況認識、意思決定</li>
          </ul>
          <img src="/placeholder.svg?height=300&width=400" alt="ミッションプランニングの図表" className="w-full h-auto rounded-lg shadow-md" />
        </div>
      )
    },
    {
      title: "4. まとめ：Mission Planningの成果と効果",
      icon: <RefreshCcw className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg">適切なMission Planningがもたらすもの：</p>
          <ul className="list-disc list-inside space-y-2">
            <li>安全性の向上</li>
            <li>効率的な運航</li>
            <li>任務の成功</li>
          </ul>
          <p className="text-lg font-semibold">聴衆へのメッセージ：Mission Planningの重要性を再認識し、今後の活動に活かしましょう。</p>
        </div>
      )
    }
  ];

  const comprehensionTest = [
    {
      question: "Mission Planningの主な目的は何ですか？",
      options: [
        "飛行時間を短縮すること",
        "燃料消費を最小限に抑えること",
        "安全性を確保し、効率的な運航を実現すること",
        "パイロットの技術を向上させること"
      ],
      correctAnswer: 2
    },
    {
      question: "Mission Planningのプロセスで、最初に行うべき段階は何ですか？",
      options: [
        "ブリーフィング",
        "任務の分析",
        "計画の作成",
        "飛行後の見直し"
      ],
      correctAnswer: 1
    },
    {
      question: "CRM（クルー・リソース・マネジメント）で重要な要素は何ですか？",
      options: [
        "個人の能力向上",
        "機体の性能向上",
        "コミュニケーション、状況認識、意思決定",
        "燃料効率の最適化"
      ],
      correctAnswer: 2
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
          section: 'mission_planning',
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
          description: "Mission Planningセクションを完了しました。",
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
          <h1 className="text-3xl font-bold mb-2">Mission Planning - 任務達成へ向けた計画と準備</h1>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">学習目標</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Mission Planningの重要性を理解する。</li>
            <li>具体的な準備事項を理解し、主体的に計画を立案できる。</li>
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
              おめでとうございます！Mission Planningセクションを完了しました。
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

export default MissionPlanningPage;