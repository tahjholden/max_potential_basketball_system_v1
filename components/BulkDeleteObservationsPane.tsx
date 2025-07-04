import { useState } from "react";
import AddObservationButton from "./AddObservationButton";

interface Observation {
    id: string;
    content: string;
    observation_date: string;
}

interface Player {
    id: string;
    name: string;
}

interface BulkDeleteObservationsPaneProps {
    observations: Observation[];
    onDeleteMany?: (ids: string[]) => Promise<void>;
    showCheckboxes?: boolean;
    player?: Player | null;
    onObservationAdded?: () => void;
}

export default function BulkDeleteObservationsPane({ 
    observations, 
    onDeleteMany, 
    showCheckboxes = true,
    player,
    onObservationAdded
}: BulkDeleteObservationsPaneProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  async function handleBulkDelete() {
    if (!onDeleteMany) return;
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} observations?`)) return;
    await onDeleteMany(Array.from(selected));
    setSelected(new Set());
  }

  return (
    <div className="bg-zinc-900 rounded border border-zinc-800 p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold">Recent Observations</h2>
        {player && (
          <AddObservationButton 
            player={player} 
            onObservationAdded={onObservationAdded}
          />
        )}
      </div>
      <div className="bg-zinc-800 rounded px-4 py-2 space-y-2">
        {observations.length === 0 && (
          <div className="text-zinc-500 text-center py-2">No observations.</div>
        )}
        {observations.map(obs => (
            <div key={obs.id} className="bg-zinc-900 border border-zinc-700 rounded-md p-3">
                <div className="flex justify-between items-end gap-3">
                    <div className="flex-1">
                        <span className="text-xs text-zinc-400 block mb-1">
                            {obs.observation_date && new Date(obs.observation_date).toLocaleDateString()}
                        </span>
                        <p className="text-sm text-zinc-100">{obs.content}</p>
                    </div>
                    {showCheckboxes && (
                        <input
                            type="checkbox"
                            checked={selected.has(obs.id)}
                            onChange={() => toggle(obs.id)}
                            className="accent-gold"
                        />
                    )}
                </div>
            </div>
        ))}
      </div>
      {showCheckboxes && selected.size > 0 && (
        <div className="pt-3 flex justify-end">
            <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold"
                onClick={handleBulkDelete}
            >
                Delete {selected.size} Selected
            </button>
        </div>
      )}
    </div>
  );
} 