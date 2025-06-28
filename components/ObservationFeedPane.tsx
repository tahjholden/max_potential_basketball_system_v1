"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/ui-utils";
import DeleteButton from "./DeleteButton";
import SuccessMessage from "./SuccessMessage";
import PaneTitle from "@/components/PaneTitle";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  created_at: string;
}

interface ObservationFeedPaneProps {
  observations: Observation[];
  onAddObservation?: () => void;
  onDeleteMany?: (ids: string[]) => void;
  successMessage?: string;
}

export default function ObservationFeedPane({
  observations,
  onDeleteMany,
  onAddObservation,
  successMessage,
}: ObservationFeedPaneProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const dateRange = observations.length
    ? `Observations from ${formatDate(observations[0].observation_date)} to ${formatDate(observations[observations.length - 1].observation_date)}`
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
        <PaneTitle>Recent Observations</PaneTitle>
        {onAddObservation && (
          <button
            onClick={onAddObservation}
            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors"
          >
            Add
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-3 p-2 bg-green-900/20 border border-green-500 rounded text-green-300 text-sm">
          {successMessage}
        </div>
      )}

      <div className="space-y-3">
        {observations.length === 0 ? (
          <div className="text-zinc-500 text-sm text-center py-4">
            No observations found.
          </div>
        ) : (
          observations.map((observation) => (
            <div key={observation.id} className="bg-zinc-800 p-3 rounded text-sm">
              <p className="text-zinc-300 mb-2">{observation.content}</p>
              <p className="text-xs text-zinc-500">
                {formatDate(observation.observation_date)}
              </p>
            </div>
          ))
        )}
      </div>

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
  );
} 