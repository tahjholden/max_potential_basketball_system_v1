"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { NoTeamsEmptyState } from "@/components/ui/EmptyState";

interface Player {
  id: string;
  name: string;
}

interface Observation {
  id: string;
  playerId: string;
  content: string;
  date: string;
  title: string;
  summary: string;
  coach: string;
}

interface ObservationsPageClientProps {
  players: Player[];
  observations: Observation[];
}

function ObservationDetailPanel({ observation }: { observation: Observation | null }) {
  return (
    <div className="w-full h-full">
      {/* Teaser Feature Block */}
      <div className="bg-zinc-800 p-4 rounded">
        <div className="p-3 bg-zinc-900 rounded border border-dashed border-[#d8cc97]">
          <p className="text-sm text-[#d8cc97] font-semibold mb-2">
            🚀 Coming Soon to This Panel:
          </p>
          <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>AI-powered constraint suggestions</li>
            <li>Tag trend visualizations</li>
            <li>Drill recommendations based on this observation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ObservationsPageClient({ 
  players, 
  observations 
}: ObservationsPageClientProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const supabase = createClient();

  const filteredObservations = selectedPlayer
    ? observations.filter((obs) => obs.playerId === selectedPlayer.id)
    : [];

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setSelectedObservation(null);
  };

  const handleObservationSelect = (observation: Observation) => {
    setSelectedObservation(observation);
  };

  const handleDeleteObservation = async () => {
    if (!selectedObservation) return;
    
    const { error } = await supabase
      .from("observations")
      .delete()
      .eq("id", selectedObservation.id);
    
    if (error) {
      toast.error("Failed to delete observation");
    } else {
      toast.success("Observation deleted successfully");
      setSelectedObservation(null);
      // Refresh the page to update the data
      window.location.reload();
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-[#161616] text-white">
      {/* LEFT PANE: Player List */}
      <div className="w-1/4 border-r border-zinc-800 p-4">
        <h2 className="text-xl font-bold mb-4">Players</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-zinc-800 text-sm placeholder-gray-400"
        />
        {players.length === 0 ? (
          <NoTeamsEmptyState onAddTeam={() => {}} />
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerSelect(player)}
              className={`p-2 mb-2 rounded cursor-pointer ${
                selectedPlayer?.id === player.id
                  ? "bg-[#d8cc97] text-black font-semibold"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              <p className="font-medium">{player.name}</p>
              <p className="text-xs text-gray-400">
                {observations.filter((obs) => obs.playerId === player.id).length} observations
              </p>
            </div>
          ))
        )}
      </div>

      {/* CENTER PANE: Player's Observations */}
      <div className="w-1/2 border-r border-zinc-800 p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedPlayer
            ? `${selectedPlayer.name}'s Observations`
            : "Select a player to view their observations"}
        </h2>
        {selectedPlayer ? (
          filteredObservations.length > 0 ? (
            <div className="space-y-3">
              {filteredObservations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => handleObservationSelect(obs)}
                  className={`bg-zinc-800 p-3 rounded cursor-pointer hover:bg-zinc-700 ${
                    selectedObservation?.id === obs.id ? "ring-2 ring-[#d8cc97]" : ""
                  }`}
                >
                  <p className="text-xs text-gray-400">{obs.date}</p>
                  <p className="font-semibold line-clamp-1">{obs.summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No observations found.</p>
          )
        ) : (
          <p className="text-sm text-gray-500">Pick a player to begin.</p>
        )}
      </div>

      {/* RIGHT PANE: Observation Detail with Tabs */}
      <div className="w-1/4 p-6">
        <h2 className="text-xl font-bold mb-4">Coming Soon</h2>
        <ObservationDetailPanel observation={selectedObservation} />
      </div>
    </div>
  );
} 