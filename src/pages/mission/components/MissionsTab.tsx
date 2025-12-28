import { Target } from 'lucide-react';
import React from 'react';
import MissionCard from '../../../components/marketing/MissionCard';
import { Mission, UserMission, UserRank } from '../../../types/gamification';

interface MissionsTabProps {
  profile: {
    rank: UserRank;
    available_missions: Mission[];
  };
  oneTimeMissions: Mission[];
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  completedMissionsMap: Map<string, UserMission>;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  profile,
  oneTimeMissions,
  dailyMissions,
  weeklyMissions,
  completedMissionsMap,
}) => {
  return (
    <div className="space-y-8">
      {/* One-time Missions */}
      {oneTimeMissions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-whiskyPapa-yellow" />
            <h2 className="text-2xl font-bold">通常ミッション</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oneTimeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={completedMissionsMap.has(mission.id)}
                completedAt={completedMissionsMap.get(mission.id)?.completed_at}
                userRank={profile.rank}
              />
            ))}
          </div>
        </section>
      )}

      {/* Daily Missions */}
      {dailyMissions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-whiskyPapa-yellow" />
            <h2 className="text-2xl font-bold">デイリーミッション</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={completedMissionsMap.has(mission.id)}
                completedAt={completedMissionsMap.get(mission.id)?.completed_at}
                userRank={profile.rank}
              />
            ))}
          </div>
        </section>
      )}

      {/* Weekly Missions */}
      {weeklyMissions.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-whiskyPapa-yellow" />
            <h2 className="text-2xl font-bold">ウィークリーミッション</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={completedMissionsMap.has(mission.id)}
                completedAt={completedMissionsMap.get(mission.id)?.completed_at}
                userRank={profile.rank}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Missions Available */}
      {profile.available_missions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">利用可能なミッションはありません</p>
        </div>
      )}
    </div>
  );
};

