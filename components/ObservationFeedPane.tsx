"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import DeleteButton from "./DeleteButton";
import SuccessMessage from "./SuccessMessage";

export default function ObservationFeedPane({
  playerName,
  observations,
  onDeleteMany,
  onAddObservation,
  successMessage,
}: {
  playerName: string;
  observations: any[];
  onDeleteMany?: (ids: string[]) => void;
  onAddObservation?: () => void;
  successMessage?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const dateRange = observations.length
    ? `Observations from ${format(new Date(observations[0].observation_date), "MMM d, yyyy")} to ${format(new Date(observations[observations.length - 1].observation_date), "MMM d, yyyy")}`
    : null;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (onDeleteMany && selected.length > 0) {
      onDeleteMany(selected);
      setSelected([]);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-zinc-100 text-sm font-semibold">Observations: {playerName}</h2>
        {onAddObservation && (
          <button
            onClick={onAddObservation}
            className="bg-gold hover:bg-gold/80 text-black text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          >
            Add Observation
          </button>
        )}
      </div>
      {successMessage && <SuccessMessage message={successMessage} />}

      <div className="mt-4">
        {observations.length === 0 ? (
          <p className="text-zinc-500 text-sm">No observations found.</p>
        ) : (
          <ul className="space-y-3">
            {observations.map((obs) => (
              <li key={obs.id} className="bg-zinc-800 p-3 rounded text-sm text-zinc-200 flex items-start justify-between">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    {format(new Date(obs.observation_date), "MMM d, yyyy")}
                  </p>
                  <p>{obs.content}</p>
                </div>
                {onDeleteMany && (
                  <input
                    type="checkbox"
                    checked={selected.includes(obs.id)}
                    onChange={() => toggleSelect(obs.id)}
                    className="ml-3 mt-1 accent-yellow-500"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        {selected.length > 0 && (
          <div className="mt-6 border-t border-zinc-700 pt-4 flex justify-end">
            <DeleteButton
              onConfirm={handleBulkDelete}
              entity={`${selected.length} Observation${selected.length > 1 ? "s" : ""}`}
              description="This will permanently delete the selected observations."
              label={`Delete ${selected.length} Observation${selected.length > 1 ? "s" : ""}`}
              iconOnly={false}
              triggerClassName="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
} 