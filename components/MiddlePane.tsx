import PlayerMetadataCard from "./PlayerMetadataCard";
import BulkDeleteObservationsPane from "./BulkDeleteObservationsPane";
import { useCoach } from "@/hooks/useCoach";
// import DevelopmentPlanCard from "./DevelopmentPlanCard";

interface Player {
    id: string;
    name: string;
    joined: string;
    team_name?: string;
}

interface Observation {
    id: string;
    content: string;
    observation_date: string;
    archived: boolean;
}

interface Pdp {
    id: string;
    content: string | null;
    created_at: string;
}

interface MiddlePaneProps {
    player: Player | null;
    observations: Observation[];
    pdp: Pdp | null;
    onDeleteMany: (ids: string[]) => Promise<void>;
    onPdpUpdate?: () => void;
    onObservationAdded?: () => void;
}

export default function MiddlePane({
  player,
  observations,
  pdp,
  onDeleteMany,
  onPdpUpdate,
  onObservationAdded
}: MiddlePaneProps) {
  const { isAdmin, isSuperadmin } = useCoach();
  console.log("MiddlePane observations prop:", observations);
  return (
    <div className="flex flex-col gap-4">
      {player && <PlayerMetadataCard 
        player={player} 
        playerId={player.id}
        isAdminOrSuperadmin={isAdmin || isSuperadmin}
      />}
      <BulkDeleteObservationsPane
        observations={observations}
        onDeleteMany={onDeleteMany}
        player={player}
        onObservationAdded={onObservationAdded}
      />
      {/* <DevelopmentPlanCard
        player={player}
        pdp={pdp}
        onPdpUpdate={onPdpUpdate}
      /> */}
    </div>
  );
} 