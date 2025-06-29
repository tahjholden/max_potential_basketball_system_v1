import type { Observation } from "@/types/entities";
import SectionLabel from "@/components/ui/SectionLabel";
import EmptyCard from "@/components/ui/EmptyCard";

export default function ObservationsCard({ observations }: { observations: Observation[] }) {
  if (!observations || observations.length === 0) {
    return <EmptyCard title="No observations found." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Observations</SectionLabel>
      {observations.map((obs) => (
        <div
          key={obs.id}
          className="rounded-lg px-4 py-2 bg-zinc-800 border border-zinc-700"
        >
          <div className="text-xs text-zinc-400 mb-1">
            {obs.observation_date}
          </div>
          <div className="text-base text-zinc-100">
            {obs.content}
          </div>
        </div>
      ))}
    </div>
  );
} 