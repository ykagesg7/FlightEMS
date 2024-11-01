import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, FileText, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Course() {
  const [user, setUser] = useState(null);
  const [completedUnits, setCompletedUnits] = useState([]);
  const { toast } = useToast();

  const lessons = [
    { 
      id: 1, 
      title: '航空気象１：大気の基礎知識',
      stages: [
        {
          title: 'STAGE-1：大気の構造',
          units: [
            { id: 'unit1', title: 'UNIT-1：大気の層とその特徴', route: '/weather/basics1' },
            { id: 'unit2', title: 'UNIT-2：トロポポーズの役割', route: '/weather/basics2' },
            { id: 'unit3', title: 'UNIT-3：気圧と高度の関係', route: '/weather/basics3' },
          ]
        },
        {
          title: 'STAGE-2：大気の構造',
          units: [
            { id: 'unit4', title: 'UNIT-4：単位と換算', route: '/weather/basics4' },
            { id: 'unit5', title: '標準大気', route: '/weather/basics5' },
            { id: 'unit6', title: '大気の状態', route: '/weather/basics6' },
          ]
        }
      ],
      route: '/weather', 
      section: 'weather',
    },
    { 
      id: 2, 
      title: 'Mission Planning', 
      stages: [
        {
          title: 'STAGE-1：Mission Planning基礎',
          units: [
            { id: 'unit1', title: 'Mission Planningの概要', route: '/mission-planning/overview' },
            { id: 'unit2', title: '情報収集と分析', route: '/mission-planning/intel' },
            { id: 'unit3', title: '計画立案と実行', route: '/mission-planning/execution' },
          ]
        }
      ],
      route: '/mission-planning', 
      section: 'mission_planning',
    },
  ];

  useEffect(() => {
    const fetchUserAndProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_progress')
            .select('completed_units')
            .eq('user_id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('No existing progress found for this user');
              await supabase.from('user_progress').insert({
                user_id: user.id,
                completed_units: []
              });
            } else {
              throw error;
            }
          } else {
            setCompletedUnits(data.completed_units || []);
          }
        } catch (error) {
          console.error('Error fetching user progress:', error);
          toast({
            title: "エラー",
            description: "ユーザーの進捗情報の取得中にエラーが発生しました。",
            variant: "destructive",
          });
        }
      }
    };

    fetchUserAndProgress();
  }, [toast]);

  const calculateProgress = () => {
    const totalUnits = lessons.reduce((acc, lesson) => 
      acc + lesson.stages.reduce((stageAcc, stage) => stageAcc + stage.units.length, 0), 0);
    return (completedUnits.length / totalUnits) * 100;
  };

  const isUnitCompleted = (unitId) => {
    return completedUnits.includes(`WeatherBasics${unitId.charAt(unitId.length - 1)}`);
  };

  const isUnitUnlocked = (units, unitIndex) => {
    if (unitIndex === 0) return true;
    return isUnitCompleted(units[unitIndex - 1].id);
  };

  const markUnitAsCompleted = async (unitId) => {
    if (user && !isUnitCompleted(unitId)) {
      const updatedCompletedUnits = [...completedUnits, unitId];
      try {
        const { error } = await supabase
          .from('user_progress')
          .update({ completed_units: updatedCompletedUnits })
          .eq('user_id', user.id);

        if (error) throw error;

        setCompletedUnits(updatedCompletedUnits);
        toast({
          title: "完了",
          description: "ユニットが完了しました。",
        });
      } catch (error) {
        console.error('Error updating user progress:', error);
        toast({
          title: "エラー",
          description: "進捗の更新中にエラーが発生しました。",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Fighter Pilot Course</h1>
      
      {lessons.map((lesson) => (
        <Card key={lesson.id} className="mb-8">
          <CardHeader>
            <CardTitle>{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent>
            {lesson.stages.map((stage, stageIndex) => (
              <div key={stageIndex} className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{stage.title}</h3>
                <div className="space-y-2">
                  {stage.units.map((unit, unitIndex) => (
                    <Link key={unit.id} to={unit.route}>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        disabled={!isUnitUnlocked(stage.units, unitIndex)}
                      >
                        {isUnitUnlocked(stage.units, unitIndex) ? (
                          <FileText className="mr-2 h-4 w-4" />
                        ) : (
                          <Lock className="mr-2 h-4 w-4" />
                        )}
                        {unit.title}
                        {isUnitCompleted(unit.id) && (
                          <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={calculateProgress()} className="w-full" />
          <p className="mt-2">{completedUnits.length} of {lessons.reduce((acc, lesson) => 
            lesson.stages.reduce((stageAcc, stage) => stageAcc + stage.units.length, acc), 0)} units completed</p>
        </CardContent>
      </Card>
    </div>
  );
}