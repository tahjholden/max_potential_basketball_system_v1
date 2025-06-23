import { format } from "date-fns";
import PaneTitle from "@/components/PaneTitle";
import EditPDPButton from "./EditPDPButton";
import ArchiveCreateNewModal from "./ArchiveCreateNewModal";

interface Player {
  id: string;
  name: string;
}

interface Pdp {
  id: string;
  content: string | null;
  created_at: string;
}

interface DevelopmentPlanCardProps {
  player: Player | null;
  pdp: Pdp | null;
  onPdpUpdate?: () => void;
  showActions?: boolean;
}

export default function DevelopmentPlanCard({
  player,
  pdp,
  onPdpUpdate,
  showActions = true,
}: DevelopmentPlanCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <PaneTitle>Development Plan</PaneTitle>
          <div className="text-xs text-zinc-400 mt-1">
            Started: {pdp?.created_at ? format(new Date(pdp.created_at), "MMM dd, yyyy") : "—"}
          </div>
        </div>
        {pdp && player && showActions && (
          <div className="flex gap-2">
            {onPdpUpdate && (
              <>
                <EditPDPButton
                  player={player}
                  pdp={{...pdp, start_date: pdp.created_at}}
                  onUpdate={onPdpUpdate}
                />
                <ArchiveCreateNewModal playerId={player.id} onSuccess={onPdpUpdate} />
              </>
            )}
          </div>
        )}
      </div>
      <div className="bg-zinc-800 rounded px-4 py-3">
        <div className="text-sm text-zinc-200 whitespace-pre-line">
          {pdp?.content || "No active plan."}
        </div>
      </div>
    </div>
  );
} 