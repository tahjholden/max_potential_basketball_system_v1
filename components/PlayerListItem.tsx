import { useState } from "react";

interface Observation {
  id: string;
  content: string;
  observation_date: string;
}

interface PDP {
  content: string;
  start_date?: string;
}

interface PlayerListItemProps {
  player: { id: string; name: string };
  pdp?: PDP | null;
  observations: Observation[];
  onEditPDP: (player: any) => void;
  onCreateOrArchivePDP: (player: any) => void;
}

export default function PlayerListItem({
  player,
  pdp,
  observations,
  onEditPDP,
  onCreateOrArchivePDP,
}: PlayerListItemProps) {
  const [open, setOpen] = useState(false);
  const hasPDP = !!pdp;

  return (
    <div
      className={`bg-[#1e1e1e] rounded-lg mb-3 transition-all ${
        hasPDP ? "border-l-4 border-[#d8cc97]" : "border-l-4 border-transparent"
      }`}
    >
      {/* Collapsed Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-[#262626] rounded-lg"
      >
        <span className="text-sm font-medium text-slate-100">{player.name}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm text-slate-300">
          {/* PDP Section */}
          <div>
            <p className="text-slate-400 font-semibold mb-1">PDP:</p>
            {hasPDP ? (
              <p className="italic">{pdp?.content}</p>
            ) : (
              <p className="italic text-slate-500">No active development plan.</p>
            )}
            <div className="mt-2 flex gap-2 justify-end">
              {hasPDP ? (
                <>
                  <button
                    onClick={() => onEditPDP(player)}
                    className="text-xs px-2 py-1 border border-[#d8cc97] text-[#d8cc97] rounded hover:bg-[#d8cc97] hover:text-black transition"
                  >
                    Edit PDP
                  </button>
                  <button
                    onClick={() => onCreateOrArchivePDP(player)}
                    className="text-xs px-2 py-1 border border-slate-500 text-slate-300 rounded hover:bg-slate-600 hover:text-white transition"
                  >
                    Archive & Create New
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onCreateOrArchivePDP(player)}
                  className="text-xs px-2 py-1 border border-slate-500 text-slate-300 rounded hover:bg-slate-600 hover:text-white transition"
                >
                  Create New PDP
                </button>
              )}
            </div>
          </div>

          {/* Observations Section */}
          <div>
            <p className="text-slate-400 font-semibold mb-1">Recent Observations:</p>
            {observations.length > 0 ? (
              <ul className="text-xs space-y-1">
                {observations.slice(0, 2).map((obs) => (
                  <li key={obs.id}>
                    <span className="text-slate-500 mr-1">
                      {new Date(obs.observation_date).toLocaleDateString()}:
                    </span>
                    {obs.content}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-slate-500">No observations found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 