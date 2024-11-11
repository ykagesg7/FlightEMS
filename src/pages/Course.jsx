import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CheckCircle, FileText, Lock, ChevronDown, ChevronRight, BookOpen } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

export default function Course() {
  const [user, setUser] = useState(null)
  const [completedUnits, setCompletedUnits] = useState([])
  const { toast } = useToast()
  const lessons = [
    { 
      id: 1, 
      title: '航空気象',
      sections: [
        {
          title: '１：大気の基礎知識',
          stages: [
            {
              id: 'weather-basics-1',
              title: 'STAGE-1：大気の構造',
              units: [
                { id: 'weather-basics-1-1', title: 'UNIT-1：大気の層とその特徴', route: '/weather/basics/1' },
                { id: 'weather-basics-1-2', title: 'UNIT-2：トロポポーズの役割', route: '/weather/basics/2' },
                { id: 'weather-basics-1-3', title: 'UNIT-3：気圧と高度の関係', route: '/weather/basics/3' },
              ]
            },
            {
              id: 'weather-basics-2',
              title: 'STAGE-2：大気の組成',
              units: [
                { id: 'weather-basics-2-1', title: 'UNIT-1：大気の主な成分', route: '/weather/basics/4' },
                { id: 'weather-basics-2-2', title: 'UNIT-2：水蒸気と気象への影響', route: '/weather/basics/5' },
              ]
            },
            {
              id: 'weather-basics-3',
              title: 'STAGE-3：温度と気圧の関係',
              units: [
                { id: 'weather-basics-3-1', title: 'UNIT-6：気温の減率とその意味', route: '/weather/basics/6' },
                { id: 'weather-basics-3-2', title: 'UNIT-7：等温層と逆転層', route: '/weather/basics/7' },
                { id: 'weather-basics-3-3', title: 'UNIT-8：気圧高度計算の基礎', route: '/weather/basics/8' },
              ]
            }
          ]
        },
        {
          title: '２：気象要素とその影響',
          stages: [
            {
              id: 'weather-elements-1',
              title: 'STAGE-1：温度',
              units: [
                { id: 'weather-elements-1-1', title: 'UNIT-1：気温の変化が航空機に与える影響', route: '/weather/elements/1' },
                { id: 'weather-elements-1-2', title: 'UNIT-2：気温と大気密度の関係', route: '/weather/elements/2' },
              ]
            },
            {
              id: 'weather-elements-2',
              title: 'STAGE-2：気圧',
              units: [
                { id: 'weather-elements-2-1', title: 'UNIT-3：高気圧と低気圧の特徴', route: '/weather/elements/3' },
                { id: 'weather-elements-2-2', title: 'UNIT-4：等圧線と風の関係', route: '/weather/elements/4' },
              ]
            },
            {
              id: 'weather-elements-3',
              title: 'STAGE-3：風',
              units: [
                { id: 'weather-elements-3-1', title: 'UNIT-5：風の生成メカニズム', route: '/weather/elements/5' },
                { id: 'weather-elements-3-2', title: 'UNIT-6：地上風と上層風の違い', route: '/weather/elements/6' },
                { id: 'weather-elements-3-3', title: 'UNIT-7：ジェット気流の特徴', route: '/weather/elements/7' },
              ]
            },
            {
              id: 'weather-elements-4',
              title: 'STAGE-4：湿度と雲',
              units: [
                { id: 'weather-elements-4-1', title: 'UNIT-8：相対湿度と露点温度', route: '/weather/elements/8' },
                { id: 'weather-elements-4-2', title: 'UNIT-9：雲の分類と特徴', route: '/weather/elements/9' },
                { id: 'weather-elements-4-3', title: 'UNIT-10：雲の生成過程', route: '/weather/elements/10' },
              ]
            }
          ]
        },
        {
          title: '３：航空機に影響を与える気象現象',
          stages: [
            {
              id: 'weather-phenomenon-1',
              title: 'STAGE-1：乱気流',
              units: [
                { id: 'weather-phenomenon-1-1', title: 'UNIT-1：乱気流の種類と発生原因', route: '/weather/phenomenon/1' },
                { id: 'weather-phenomenon-1-2', title: 'UNIT-2：乱気流が航空機に与える影響', route: '/weather/phenomenon/2' },
              ]
            },
            {
              id: 'weather-phenomenon-2',
              title: 'STAGE-2：低視程',
              units: [
                { id: 'weather-phenomenon-2-1', title: 'UNIT-3：霧ともやの違い', route: '/weather/phenomenon/3' },
                { id: 'weather-phenomenon-2-2', title: 'UNIT-4：視程低下時の注意点', route: '/weather/phenomenon/4' },
              ]
            },
            {
              id: 'weather-phenomenon-3',
              title: 'STAGE-3：着氷',
              units: [
                { id: 'weather-phenomenon-3-1', title: 'UNIT-5：着氷の種類と形成条件', route: '/weather/phenomenon/5' },
                { id: 'weather-phenomenon-3-2', title: 'UNIT-6：着氷が航空機に与える影響', route: '/weather/phenomenon/6' },
              ]
            },
            {
              id: 'weather-phenomenon-4',
              title: 'STAGE-4：雷雨・積乱雲',
              units: [
                { id: 'weather-phenomenon-4-1', title: 'UNIT-7：雷雨の発達段階', route: '/weather/phenomenon/7' },
                { id: 'weather-phenomenon-4-2', title: 'UNIT-8：積乱雲の識別と回避方法', route: '/weather/phenomenon/8' },
                { id: 'weather-phenomenon-4-3', title: 'UNIT-9：ダウンバーストとマイクロバースト', route: '/weather/phenomenon/9' },
              ]
            },
            {
              id: 'weather-phenomenon-5',
              title: 'STAGE-5：ウインド・シア',
              units: [
                { id: 'weather-phenomenon-5-1', title: 'UNIT-10：ウインドシアの発生要因', route: '/weather/phenomenon/10' },
                { id: 'weather-phenomenon-5-2', title: 'UNIT-11：ウインドシアへの対応策', route: '/weather/phenomenon/11' },
              ]
            }
          ]
        },
        {
          title: '４：気象情報の取得と解釈',
          stages: [
            {
              id: 'weather-information-1',
              title: 'STAGE-1：METAR、TAFの読み方',
              units: [
                { id: 'weather-information-1-1', title: 'UNIT-1：METARの基本構造と解釈方法', route: '/weather/information/1' },
                { id: 'weather-information-1-2', title: 'UNIT-2：TAFの予報内容の理解', route: '/weather/information/2' },
              ]
            },
            {
              id: 'weather-information-2',
              title: 'STAGE-2：天気図の読み方',
              units: [
                { id: 'weather-information-2-1', title: 'UNIT-3：地上天気図の記号と意味', route: '/weather/information/3' },
                { id: 'weather-information-2-2', title: 'UNIT-4：高層天気図の利用方法', route: '/weather/information/4' },
              ]
            },
            {
              id: 'weather-information-3',
              title: 'STAGE-3：気象レーダー・衛星画像の利用',
              units: [
                { id: 'weather-information-3-1', title: 'UNIT-5：気象レーダーでの雨雲の見方', route: '/weather/information/5' },
                { id: 'weather-information-3-2', title: 'UNIT-6：衛星画像からの情報取得', route: '/weather/information/6' },
              ]
            }
          ]
        },
        {
          title: '５：気象による航空ハザードと対策',
          stages: [
            {
              id: 'weather-hazard-1',
              title: 'STAGE-1：気象による飛行計画の変更',
              units: [
                { id: 'weather-hazard-1-1', title: 'UNIT-1：代替飛行場の選択基準', route: '/weather/hazard/1' },
                { id: 'weather-hazard-1-2', title: 'UNIT-2：フライトプラン修正の手順', route: '/weather/hazard/2' },
              ]
            },
            {
              id: 'weather-hazard-2',
              title: 'STAGE-2：気象と緊急時対応',
              units: [
                { id: 'weather-hazard-2-1', title: 'UNIT-3：悪天候時のコミュニケーション', route: '/weather/hazard/3' },
                { id: 'weather-hazard-2-2', title: 'UNIT-気象による緊急着陸の判断', route: '/weather/hazard/4' },
              ]
            }
          ]
        },
        {
          title: '６：航空気象における規則と手順',
          stages: [
            {
              title: 'STAGE-1：ICAO気象規則の概要',
              units: [
                { id: 'weather-regulations-1-1', title: 'UNIT-1：国際標準気象コードの理解', route: '/weather/regulations1' },
                { id: 'weather-regulations-1-2', title: 'UNIT-2：気象通報の国際基準', route: '/weather/regulations2' },
              ]
            },
            {
              title: 'STAGE-2：国内の航空気象規定',
              units: [
                { id: 'weather-regulations-2-1', title: 'UNIT-3：航空法における気象規定', route: '/weather/regulations3' },
                { id: 'weather-regulations-2-2', title: 'UNIT-4：気象情報提供システムの利用', route: '/weather/regulations4' },
              ]
            }
          ]
        }
      ],
      route: '/weather', 
      section: 'weather',
    },
    { 
      id: 2, 
      title: 'Mission Planning', 
      sections: [
        {
          title: '１：Mission Planning基礎',
          stages: [
            {
              id: 'mission-planning-1',
              title: 'STAGE-1：Mission Planning概要',
              units: [
                { id: 'mission-planning-1-1', title: 'UNIT-1：Mission Planningの概要', route: '/mission-planning/1' },
                { id: 'mission-planning-1-2', title: 'UNIT-2：情報収集と分析', route: '/mission-planning/2' },
                { id: 'mission-planning-1-3', title: 'UNIT-3：計画立案と実行', route: '/mission-planning/3' },
              ]
            }
          ]
        }
      ],
      route: '/mission-planning', 
      section: 'mission_planning',
    },
  ];

  useEffect(() => {
    const fetchUserAndProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_progress')
            .select('completed_units')
            .eq('user_id', user.id)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('このユーザーの既存の進捗情報が見つかりません')
              await supabase.from('user_progress').insert({
                user_id: user.id,
                completed_units: []
              })
              setCompletedUnits([])
            } else {
              throw error
            }
          } else {
            setCompletedUnits(data.completed_units || [])
          }
        } catch (error) {
          console.error('ユーザー進捗情報の取得中にエラーが発生しました:', error)
          toast({
            title: "エラー",
            description: "ユーザーの進捗情報の取得中にエラーが発生しました。",
            variant: "destructive",
          })
        }
      }
    }

    fetchUserAndProgress()
  }, [toast])

  const calculateProgress = () => {
    const totalUnits = lessons.reduce((lessonAcc, lesson) => 
      lessonAcc + lesson.sections.reduce((sectionAcc, section) =>
        sectionAcc + section.stages.reduce((stageAcc, stage) =>
          stageAcc + stage.units.length, 0), 0), 0)
    return (completedUnits.length / totalUnits) * 100
  }

  const isUnitCompleted = (unitId) => completedUnits.includes(unitId)
  const isStageCompleted = (stage) => stage.units.every(unit => isUnitCompleted(unit.id))
  const isUnitUnlocked = (units, unitIndex) => unitIndex === 0 || isUnitCompleted(units[unitIndex - 1].id)
  const isSectionCompleted = (section) => section.stages.every(stage => isStageCompleted(stage))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">事業用操縦士コース</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">コース進捗状況</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="w-full h-4 mb-4" />
          <p className="text-lg font-semibold text-center">
            {completedUnits.length} / {lessons.reduce((lessonAcc, lesson) => 
              lesson.sections.reduce((sectionAcc, section) => 
                sectionAcc + section.stages.reduce((stageAcc, stage) => 
                  stageAcc + stage.units.length, 0), lessonAcc), 0)} ユニット完了
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="mr-2 h-6 w-6" />
                {lesson.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {lesson.sections.map((section, sectionIndex) => (
                <Collapsible key={sectionIndex} className="mb-4">
                  <CollapsibleTrigger className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <h2 className={`text-xl font-semibold flex-grow ${isSectionCompleted(section) ? 'text-green-600' : ''}`}>
                      {section.title}
                    </h2>
                    <ChevronDown className="h-5 w-5 flex-shrink-0" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    {section.stages.map((stage, stageIndex) => (
                      <Collapsible key={stageIndex} className="ml-4 mb-2">
                        <CollapsibleTrigger className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors">
                          <h3 className="text-lg font-medium flex-grow">{stage.title}</h3>
                          {isStageCompleted(stage) && (
                            <Badge variant="success" className="mr-2">完了</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 mt-2">
                          {stage.units.map((unit, unitIndex) => (
                            <Link key={unit.id} to={unit.route}>
                              <Button 
                                variant={isUnitCompleted(unit.id) ? "default" : "outline"}
                                className="w-full justify-start text-left h-auto py-2"
                                disabled={!isUnitUnlocked(stage.units, unitIndex)}
                              >
                                {isUnitUnlocked(stage.units, unitIndex) ? (
                                  <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
                                ) : (
                                  <Lock className="mr-2 h-4 w-4 flex-shrink-0" />
                                )}
                                <span className="flex-grow">{unit.title}</span>
                                {isUnitCompleted(unit.id) && (
                                  <CheckCircle className="ml-2 h-4 w-4 text-green-500 flex-shrink-0" />
                                )}
                              </Button>
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}