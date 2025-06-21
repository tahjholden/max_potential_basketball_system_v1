import React from "react";

export default function PlayerDetailLayout({
  player,
  pdp,
  observations,
  onEditPDP,
  onArchivePDP,
  onAddObservation,
  onDeleteObservation,
}: {
  player: { id: string; name: string };
  pdp: { id: string; content: string; start_date: string } | null;
  observations: { id: string; content: string; date: string; coach: string }[];
  onEditPDP: () => void;
  onArchivePDP: () => void;
  onAddObservation: () => void;
  onDeleteObservation: (id: string) => void;
}) {
  const formattedStartDate = pdp?.start_date
    ? new Date(pdp.start_date).toLocaleDateString()
    : null;

  return (
    <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
      <div className="text-sm text-slate-400 mb-4">
        <a href="/players" className="hover:underline">&larr; Back to Players</a>
      </div>

      <h1 className="text-2xl font-bold text-slate-100 mb-6">{player.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDP Panel */}
        <div className="space-y-4">
          <div className="bg-[#1e1e1e] border border-slate-700 rounded p-4">
            <h3 className="text-sm text-slate-400 mb-1">Current PDP</h3>
            {pdp ? (
              <>
                <p className="text-slate-300 italic mb-2">{pdp.content}</p>
                <p className="text-xs text-slate-500">Started: {formattedStartDate}</p>
                <div className="mt-4 space-y-2">
                  <button onClick={onEditPDP} className="w-full text-sm border border-[#d8cc97] text-[#d8cc97] rounded px-3 py-2 hover:bg-[#d8cc97] hover:text-black transition">
                    Edit PDP
                  </button>
                  <button onClick={onArchivePDP} className="w-full bg-red-600 text-white text-sm px-3 py-2 rounded hover:bg-red-500 transition">
                    Archive & Replace
                  </button>
                </div>
              </>
            ) : (
              <p className="text-yellow-500 italic">No active PDP.</p>
            )}
          </div>
        </div>

        {/* Observations Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm text-slate-300 font-semibold">Recent Observations ({observations.length})</h2>
            <button
              onClick={onAddObservation}
              className="bg-[#d8cc97] text-black px-3 py-1 rounded font-semibold text-sm hover:bg-yellow-300"
            >
              + Add Observation
            </button>
          </div>

          {observations.length === 0 ? (
            <p className="text-slate-500 italic text-sm">No observations yet.</p>
          ) : (
            <ul className="space-y-3">
              {observations.map(obs => (
                <li key={obs.id} className="bg-[#1e1e1e] border border-slate-700 p-4 rounded relative">
                  <p className="text-sm text-white mb-1">{obs.content}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(obs.date).toLocaleDateString()} — {obs.coach}
                  </p>
                  <button
                    onClick={() => onDeleteObservation(obs.id)}
                    className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-200"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 