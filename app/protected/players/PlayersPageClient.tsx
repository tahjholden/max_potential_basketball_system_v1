"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import ManagePDPModal from "@/components/ManagePDPModal";
import CreatePDPModal from "@/components/CreatePDPModal";
import ThreePaneLayout from "@/components/ThreePaneLayout";
import { GoldButton } from "@/components/ui/gold-button";
import DeleteButton from "@/components/DeleteButton";
import toast from "react-hot-toast";

// Basic type definitions
interface Player {
  id: string;
  name: string;
  created_at: string;
}

interface Observation {
  id: string;
  player_id: string;
  content: string;
  observation_date: string;
}

interface PDP {
  id: string;
  player_id: string;
  content: string;
  start_date: string;
  archived_at?: string;
  end_date?: string | null;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
}

interface PlayersPageClientProps {
  players: Player[];
  observations: Observation[];
  pdps: PDP[];
  coach: Coach;
}

export default function PlayersPageClient({
  players,
  observations,
  pdps,
  coach,
}: PlayersPageClientProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(
    players[0] || null
  );
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePDP = selectedPlayer
    ? pdps.find(
        (pdp) => pdp.player_id === selectedPlayer.id && !pdp.archived_at
      )
    : null;

  const archivedPDPs = selectedPlayer
    ? pdps.filter(
        (pdp) => pdp.player_id === selectedPlayer.id && pdp.archived_at
      )
    : [];

  const playerObservations = selectedPlayer
    ? observations.filter((obs) => obs.player_id === selectedPlayer.id)
    : [];

  const getObservationCount = (playerId: string) => {
    return observations.filter((obs) => obs.player_id === playerId).length;
  };

  const handleDeletePlayer = async (playerId: string) => {
    const { error } = await supabase.from("players").delete().eq("id", playerId);

    if (error) {
      toast.error(`Failed to delete player: ${error.message}`);
    } else {
      toast.success("Player deleted");
      if (selectedPlayer?.id === playerId) {
        setSelectedPlayer(null);
      }
      router.refresh();
    }
  };

  const handleEditPDP = async (content: string) => {
    if (!activePDP) return;

    const { error } = await supabase
      .from("pdp")
      .update({ content })
      .eq("id", activePDP.id);

    if (error) {
      console.error("Failed to update PDP:", error);
      throw error;
    }

    router.refresh();
    setIsManageModalOpen(false);
  };

  const handleArchivePDP = async () => {
    if (!activePDP) return;

    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", activePDP.id);

    if (error) {
      console.error("Failed to archive PDP:", error);
      return;
    }
    
    setIsManageModalOpen(false);
    setIsCreateModalOpen(true);
    router.refresh();
  };

  const handleCreatePDP = async () => {
    router.refresh();
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <ThreePaneLayout
        leftPane={
          <>
            <h2 className="text-lg font-semibold mb-2">
              Players ({filteredPlayers.length})
            </h2>
            <input
              type="text"
              placeholder="Search players..."
              className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 text-white border border-zinc-700 placeholder-zinc-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-col space-y-1">
              {filteredPlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlayer(p)}
                  className={`w-full text-left px-3 py-2 rounded ${
                    selectedPlayer?.id === p.id
                      ? "bg-[#d8cc97] text-black"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {p.name}
                  <div className="text-xs opacity-70">
                    {getObservationCount(p.id)} observations
                  </div>
                </button>
              ))}
            </div>
          </>
        }
        centerPane={
          selectedPlayer ? (
            <div className="relative h-full pb-10">
              <h2 className="text-xl font-semibold mb-2">{selectedPlayer.name}</h2>
              <div className="text-sm mb-2">
                Joined: {new Date(selectedPlayer.created_at).toLocaleDateString()}
              </div>
              <div className="bg-zinc-800 rounded p-3 mb-4">
                <h3 className="font-medium text-sm mb-1">
                  Personal Development Plan
                </h3>
                {activePDP ? (
                  <>
                    <p>{activePDP.content}</p>
                    <p className="text-xs mt-1 text-zinc-400">
                      Started: {new Date(activePDP.start_date).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-zinc-400 text-sm">No active PDP.</p>
                )}
                <GoldButton
                  className="mt-4 w-full"
                  onClick={() =>
                    activePDP
                      ? setIsManageModalOpen(true)
                      : setIsCreateModalOpen(true)
                  }
                >
                  {activePDP ? "Manage PDP" : "Create PDP"}
                </GoldButton>
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">
                  Recent Observations ({playerObservations.length})
                </h3>
                {playerObservations.length > 0 ? (
                  playerObservations.slice(0, 5).map((obs) => (
                    <div key={obs.id} className="bg-zinc-800 p-3 rounded mb-2 text-sm">
                       <p className="text-xs text-gray-400">
                        {new Date(obs.observation_date).toLocaleDateString()}
                      </p>
                      <p>{obs.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">
                    No observations found.
                  </p>
                )}
              </div>
              <div className="absolute bottom-0 right-0">
                <DeleteButton
                  entity="Player"
                  onConfirm={() => handleDeletePlayer(selectedPlayer.id)}
                  description={`Are you sure you want to delete ${selectedPlayer.name}? This cannot be undone.`}
                  iconOnly={false}
                  label="Delete Player"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Select a player to view their PDP.
            </div>
          )
        }
        rightPane={
          <>
            <h3 className="text-md font-semibold mb-2">Context Viewer</h3>
            <select className="mb-3 w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white">
              <option>Archived PDPs</option>
            </select>
            {archivedPDPs.length > 0 ? (
              <div className="space-y-2">
              {archivedPDPs.map(pdp => (
                <div key={pdp.id} className="bg-zinc-800 p-3 rounded text-sm">
                  <p className="text-yellow-400 font-semibold mb-1">
                    Plan from {new Date(pdp.start_date).toLocaleDateString()}
                  </p>
                  <p className="text-zinc-400 text-xs">
                    {new Date(pdp.start_date).toLocaleDateString()} → {pdp.end_date ? new Date(pdp.end_date).toLocaleDateString() : 'Archived'}
                  </p>
                  <p className="mt-1">{pdp.content}</p>
                </div>
              ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No archived PDPs found.</p>
            )}
          </>
        }
      />

      {/* Manage PDP Modal */}
      {selectedPlayer && (
        <ManagePDPModal
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Create PDP Modal */}
      {selectedPlayer && (
        <CreatePDPModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          player={selectedPlayer}
          coachId={coach.id}
          onCreated={handleCreatePDP}
        />
      )}
    </>
  );
} 