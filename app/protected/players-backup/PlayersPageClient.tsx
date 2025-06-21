"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import toast from "react-hot-toast";

// A placeholder for the detailed view components until I can recreate them
const PlayerDetailPane = ({ player }: { player: any }) => (
  <div className="text-white">
    <h2 className="text-2xl font-bold text-gold">{player.name}</h2>
    <p>Details for {player.name} will be restored here.</p>
  </div>
);

const ObservationsPane = ({ player }: { player: any }) => (
  <div className="text-white">
    <h3 className="text-xl font-bold text-gold">Observations</h3>
    <p>Observations for {player.name} will be restored here.</p>
  </div>
);

export default function PlayersPageClient({ initialPlayers }: { initialPlayers: any[] }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (initialPlayers.length > 0) {
      setSelectedPlayer(initialPlayers[0]);
    }
  }, [initialPlayers]);

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players;
    return players.filter(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [players, searchTerm]);

  const LeftPane = (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gold mb-4">Players</h2>
      <input
        type="text"
        placeholder="Search players..."
        className="w-full p-2 rounded bg-[#2a2a2a] text-white border border-slate-600 focus:border-gold focus:outline-none mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPlayer?.id === player.id
                  ? "bg-gold text-black"
                  : "bg-[#2a2a2a] hover:bg-slate-700"
              }`}
            >
              {player.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const MainPane = (
    <div className="h-full">
      {selectedPlayer ? (
        <PlayerDetailPane player={selectedPlayer} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Select a player to view details</p>
        </div>
      )}
    </div>
  );
  
  const RightPane = (
    <div className="h-full">
        {selectedPlayer ? (
          <ObservationsPane player={selectedPlayer} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Select a player to view observations</p>
          </div>
        )}
    </div>
  );

  return (
    <ThreePaneLayout
      leftPane={LeftPane}
      mainPane={MainPane}
      rightPane={RightPane}
    />
  );
} 