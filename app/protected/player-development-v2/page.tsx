"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import ManagePDPModal from "@/components/ManagePDPModal";
import AddPlayerObservationModal from "../players/AddPlayerObservationModal";
import AddPlayerModal from "../dashboard/AddPlayerModal";

export default function PlayerDevDashboard() {
  const supabase = createClient();

  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [pdp, setPdp] = useState<any | null>(null);
  const [observations, setObservations] = useState<any[]>([]);

  const [managePdpOpen, setManagePdpOpen] = useState(false);
  const [addObsOpen, setAddObsOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [isCreatingPdp, setIsCreatingPdp] = useState(false);

  const [selectedTeamId, setSelectedTeamId] = useState("");

  const fetchDataAndEnhancePlayers = useCallback(async () => {
    const { data: playersData, error: playersError } = await supabase
      .from("players")
      .select("*")
      .order("name");
    if (playersError) {
      toast.error("Failed to fetch players");
      return;
    }

    const { data: pdpList, error: pdpError } = await supabase
      .from("pdp")
      .select("player_id, archived_at");

    if (pdpError) {
      toast.error("Failed to fetch PDPs to check status.");
      setPlayers(playersData.map((p) => ({ ...p, hasPDP: false }))); // Fallback
      return;
    }

    const enhancedPlayers = playersData.map((player) => {
      const hasPDP = pdpList.some(
        (p) => p.player_id === player.id && !p.archived_at
      );
      return { ...player, hasPDP };
    });

    setPlayers(enhancedPlayers);
  }, [supabase]);

  useEffect(() => {
    fetchDataAndEnhancePlayers();
  }, [fetchDataAndEnhancePlayers]);

  const fetchDetailsForSelectedPlayer = useCallback(async () => {
    if (!selected) {
      setPdp(null);
      setObservations([]);
      return;
    }

    const { data, error } = await supabase
      .from("pdp")
      .select("*")
      .eq("player_id", selected.id)
      .is("archived_at", null)
      .single();

    if (error && error.code !== "PGRST116") {
      toast.error("Failed to fetch PDP");
    } else {
      setPdp(data);
    }

    const { data: obsData, error: obsError } = await supabase
      .from("observations")
      .select("*")
      .eq("player_id", selected.id)
      .order("observation_date", { ascending: false });
    if (obsError) toast.error("Failed to fetch observations");
    else setObservations(obsData);
  }, [selected, supabase]);

  useEffect(() => {
    fetchDetailsForSelectedPlayer();
  }, [fetchDetailsForSelectedPlayer]);

  async function handleAddPlayer(name: string) {
    if (!selectedTeamId) {
      toast.error("No team selected");
      return;
    }
    const { error } = await supabase.from("players").insert([
      { name, team_id: selectedTeamId }
    ]);
    if (error) {
      toast.error("Failed to add player");
      console.error(error);
    } else {
      toast.success("Player added");
      setAddPlayerOpen(false);
      fetchDataAndEnhancePlayers();
    }
  }

  async function handleObservationSubmit(data: {
    player_id: string;
    content: string;
    observation_date: string;
  }) {
    const { error } = await supabase.from("observations").insert([data]);
    if (error) {
      toast.error("Failed to add observation.");
      console.error(error);
    } else {
      toast.success("Observation added!");
      setAddObsOpen(false);
      await fetchDetailsForSelectedPlayer();
    }
  }

  async function handleEditPdp(content: string) {
    if (!pdp) return;
    const { error } = await supabase
      .from("pdp")
      .update({ content })
      .eq("id", pdp.id);
    if (error) {
      toast.error("Failed to update PDP.");
      throw error;
    }
    toast.success("PDP updated successfully.");
    setManagePdpOpen(false);
    await fetchDetailsForSelectedPlayer();
  }

  async function handleArchivePdp() {
    if (!pdp) return;
    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", pdp.id);
    if (error) {
      toast.error("Failed to archive PDP.");
      throw error;
    }
    toast.success("PDP archived.");
    setManagePdpOpen(false);
    await fetchDetailsForSelectedPlayer();
    await fetchDataAndEnhancePlayers();
  }

  async function addPdp(content: string) {
    if (!selected || !content.trim()) return;
    const { error } = await supabase.from("pdp").insert([
      {
        player_id: selected.id,
        content,
        start_date: new Date().toISOString(),
      },
    ]);
    if (error) toast.error("Failed to add PDP");
    else {
      toast.success("PDP Created");
      setIsCreatingPdp(false);
      await fetchDetailsForSelectedPlayer();
      await fetchDataAndEnhancePlayers();
    }
  }

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedPlayers = [...filteredPlayers].sort(
    (a, b) => Number(a.hasPDP) - Number(b.hasPDP)
  );
  const playersNeedingPdp = sortedPlayers.filter((p) => !p.hasPDP);

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 text-white p-4">
      {/* ========== Left Pane (Player List) ========== */}
      <div className="w-[21.5%] bg-[#1f1f1f] rounded p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center">Players</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search players..."
            className="w-full bg-[#2a2a2a] border border-slate-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-[#d8cc97]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {playersNeedingPdp.length > 3 && (
          <div className="text-red-400 text-sm mb-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
            ⚠️ {playersNeedingPdp.length} players need a development plan
          </div>
        )}

        <ul className="flex-1 overflow-y-auto space-y-2">
          {sortedPlayers.length > 0 ? (
            sortedPlayers.map((player) => {
              const isSelected = selected?.id === player.id;
              const classes = [
                "p-2",
                "rounded",
                "cursor-pointer",
                "flex",
                "justify-between",
                "items-center",
                isSelected
                  ? "bg-[#d8cc97] text-black font-semibold"
                  : "bg-[#2a2a2a] hover:bg-slate-700",
                !player.hasPDP && !isSelected ? "border border-red-500" : "",
              ].join(" ");

              return (
                <li
                  key={player.id}
                  onClick={() => {
                    setSelected(player);
                    setIsCreatingPdp(false);
                  }}
                  className={classes}
                >
                  <span>{player.name}</span>
                  {!player.hasPDP && (
                    <span className="text-xs text-red-400 ml-2 whitespace-nowrap">
                      (Needs PDP)
                    </span>
                  )}
                </li>
              );
            })
          ) : (
            <p className="text-slate-400 text-center py-4">No players found.</p>
          )}
        </ul>

        <button
          className="w-full mt-4 bg-[#d8cc97] text-black py-2 rounded font-semibold hover:bg-yellow-300 transition"
          onClick={() => setAddPlayerOpen(true)}
        >
          Add Player
        </button>
      </div>

      {/* ========== Middle Pane (PDP) ========== */}
      <div className="w-[39.25%] bg-[#1f1f1f] rounded p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-center">
          Player Development Plan
        </h2>
        {selected ? (
          pdp ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-2">
                {selected.name}'s PDP
              </h3>
              <p className="text-xs text-slate-400 mb-2">
                Started: {new Date(pdp.start_date).toLocaleDateString()}
              </p>
              <div className="flex-1 overflow-y-auto">
                <p className="italic">{pdp.content}</p>
              </div>
              <button
                className="w-full mt-4 border border-[#d8cc97] text-[#d8cc97] py-2 rounded hover:bg-[#d8cc97] hover:text-black transition"
                onClick={() => setManagePdpOpen(true)}
              >
                Manage PDP
              </button>
            </>
          ) : isCreatingPdp ? (
            <>
              <h3 className="text-lg text-center font-semibold text-white mb-2">
                Create a new PDP for {selected.name}
              </h3>
              <NewPdpForm
                onSubmit={addPdp}
                onCancel={() => setIsCreatingPdp(false)}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
              <p className="italic mb-4">
                No development plan found for {selected.name}.
              </p>
              <button
                className="bg-[#d8cc97] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition"
                onClick={() => setIsCreatingPdp(true)}
              >
                Create New PDP
              </button>
            </div>
          )
        ) : (
          <>
            <p className="text-center text-slate-400 mt-2">
              Select a player to view or assign a Development Plan.
            </p>
            <div className="flex-1 flex items-center justify-center">
              <Image
                src="/maxsM.png"
                alt="Watermark"
                width={360}
                height={360}
                className="opacity-20"
              />
            </div>
          </>
        )}

        {managePdpOpen && pdp && (
          <ManagePDPModal
            open={managePdpOpen}
            onClose={() => setManagePdpOpen(false)}
            player={selected}
            pdp={pdp}
            onEdit={handleEditPdp}
            onArchive={handleArchivePdp}
          />
        )}
      </div>

      {/* ========== Right Pane (Observations) ========== */}
      <div className="w-[39.25%] bg-[#1f1f1f] rounded p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Observations</h2>
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-250px)] min-h-[300px] flex flex-col">
            {selected ? (
              observations.length > 0 ? (
                observations.map((obs) => (
                  <div key={obs.id} className="bg-[#2a2a2a] p-3 rounded mb-2">
                    <p className="text-sm text-slate-400 mb-1">
                      {new Date(obs.observation_date).toLocaleDateString()}
                    </p>
                    <p>{obs.content}</p>
                  </div>
                ))
              ) : (
                <>
                  <p className="text-center text-slate-400 mt-2">
                    No observations yet for {selected.name}.
                    <br />
                    Click "Add Observation" to get started.
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    <Image
                      src="/maxsM.png"
                      alt="Watermark"
                      width={360}
                      height={360}
                      className="opacity-20"
                    />
                  </div>
                </>
              )
            ) : (
              <>
                <p className="text-center text-slate-400 mt-2">
                  Select a player to see their observations.
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <Image
                    src="/maxsM.png"
                    alt="Watermark"
                    width={360}
                    height={360}
                    className="opacity-20"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <button
          className="w-full mt-4 bg-[#d8cc97] text-black py-2 rounded font-semibold hover:bg-yellow-300 transition disabled:opacity-50"
          onClick={() => setAddObsOpen(true)}
          disabled={!selected}
        >
          Add Observation
        </button>
      </div>

      {addPlayerOpen && (
        <AddPlayerModal
          open={addPlayerOpen}
          onClose={() => setAddPlayerOpen(false)}
          onSubmit={handleAddPlayer}
        />
      )}

      {addObsOpen && selected && (
        <AddPlayerObservationModal
          open={addObsOpen}
          player={selected}
          onClose={() => setAddObsOpen(false)}
          onSubmit={handleObservationSubmit}
        />
      )}
    </div>
  );
}

function NewPdpForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("PDP content cannot be empty.");
      return;
    }
    onSubmit(content);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter PDP details..."
        className="flex-1 w-full bg-[#2a2a2a] border border-slate-600 rounded px-3 py-2 focus:outline-none focus:ring focus:border-[#d8cc97] mb-4"
        rows={8}
      />
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm px-4 py-2 border border-slate-500 rounded text-slate-300 hover:text-white transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-[#d8cc97] text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition"
        >
          Save PDP
        </button>
      </div>
    </form>
  );
}
