import ObservationCard from "@/app/protected/players/ObservationCard";
import { getCoachName } from "@/lib/utils";

export default function ObservationList({ 
  observations, 
  playerName, 
  onDelete 
}: { 
  observations: any[], 
  playerName: string,
  onDelete: (id: string) => void 
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[#d8cc97]">
        Recent Observations ({observations?.length || 0})
      </h2>
      {observations && observations.length > 0 ? (
        <div className="space-y-4">
          {observations.map((obs: any) => (
            <ObservationCard
              key={obs.id}
              id={obs.id}
              player_name={playerName}
              content={obs.content}
              date={obs.observation_date}
              coach_name={getCoachName(obs.coaches)}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No observations yet.</p>
      )}
    </div>
  );
} 