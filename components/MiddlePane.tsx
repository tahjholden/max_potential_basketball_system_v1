import PlayerMetadataCard from "./PlayerMetadataCard";
import BulkDeleteObservationsPane from "./BulkDeleteObservationsPane";
import DevelopmentPlanCard from "./DevelopmentPlanCard";

interface Player {
    id: string;
    name: string;
    joined: string;
}

interface Observation {
    id: string;
    content: string;
    observation_date: string;
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
}

export default function MiddlePane({
  player,
  observations,
  pdp,
  onDeleteMany,
  onPdpUpdate
}: MiddlePaneProps) {
  return (
    <div className="flex flex-col gap-4">
      {player && <PlayerMetadataCard player={player} observations={observations} />}
      <BulkDeleteObservationsPane
        observations={observations}
        onDeleteMany={onDeleteMany}
      />
      <DevelopmentPlanCard
        player={player}
        pdp={pdp}
        onPdpUpdate={onPdpUpdate}
      />
    </div>
  );
} 