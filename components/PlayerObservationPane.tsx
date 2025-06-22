import React from "react";
import { format } from "date-fns";
import SuccessMessage from "@/components/SuccessMessage";

export default function PlayerObservationPane({
  playerName,
  observations,
  onAdd,
  showSuccess,
}: {
  playerName: string;
  observations: any[];
  onAdd: () => void;
  showSuccess?: boolean;
}) {
  const dateRange = observations.length
    ? `Observations from ${format(new Date(observations[0].observation_date), "MMM d, yyyy")} to ${format(new Date(observations[observations.length - 1].observation_date), "MMM d, yyyy")}`
    : null;

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-zinc-100">Recent Observations</h2>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-gold-500 text-zinc-900 text-xs font-semibold rounded hover:bg-gold-600"
        >
          Add Observation
        </button>
      </div>

      {showSuccess && <SuccessMessage message="Observation added!" />}

      {dateRange && (
        <p className="text-xs text-zinc-500 mb-4">{dateRange}</p>
      )}

      {observations.length === 0 ? (
        <p className="text-zinc-500 text-sm mt-4">No recent observations.</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {observations.map((obs) => (
            <li key={obs.id} className="bg-zinc-800 p-3 rounded text-sm text-zinc-200">
              <p className="text-xs text-zinc-500 mb-1">
                {format(new Date(obs.observation_date), "MMM d, yyyy")}
              </p>
              <p>{obs.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 