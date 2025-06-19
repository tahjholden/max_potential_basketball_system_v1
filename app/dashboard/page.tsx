"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardMetrics from "@/components/DashboardMetrics";
import PlayerList from "@/components/PlayerList";
import PDPModal from "@/components/PDPModal";
import { getDashboardData } from "@/lib/supabase";

const BG = "#111";
const GOLD = "var(--color-gold)";
const CARD = "#222";

export default function DashboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [pdps, setPdps] = useState<any[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [pdpModalOpen, setPdpModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("players").select("id,name").then(({ data }) => setPlayers(data || []));
    supabase
      .from("observations")
      .select("id,content,observation_date,created_at,player:player_id(name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => setObservations(data || []));
    supabase
      .from("pdp")
      .select("id,player_id,content,active")
      .then(({ data }) => setPdps(data || []));
  }, []);

  const handleAddPlayer = async () => {
    if (!newPlayer.trim()) return;
    setAddingPlayer(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("players").insert([{ name: newPlayer }]).select();
    if (!error && data && data[0]) {
      setPlayers((prev) => [...prev, data[0]]);
      setShowAddPlayer(false);
      setNewPlayer("");
    }
    setAddingPlayer(false);
  };

  const getPlayerObservations = (playerId: string) =>
    observations
      .filter((obs) => obs.player_id === playerId)
      .sort((a, b) => new Date(b.observation_date).getTime() - new Date(a.observation_date).getTime())
      .slice(0, 3);

  const getPlayerPDP = (playerId: string) => pdps.find((pdp) => pdp.player_id === playerId);

  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-rows-[auto_1fr] gap-6">
      <DashboardMetrics players={players} observations={observations} pdps={pdps} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {players.map((player) => (
          <div key={player.id} className="bg-zinc-900 rounded-2xl shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{player.name}</h3>
              <Button size="sm" onClick={() => {
                setSelectedPlayer(player);
                setPdpModalOpen(true);
              }}>Edit PDP</Button>
            </div>
            <div className="text-sm text-gold font-medium mb-2">PDP</div>
            <div className="text-sm text-white mb-4">
              {getPlayerPDP(player.id)?.content || "No PDP assigned."}
            </div>
            <div className="text-sm text-gold font-medium mb-2">Recent Observations</div>
            <ul className="space-y-2 text-sm">
              {getPlayerObservations(player.id).map((obs) => (
                <li key={obs.id} className="text-white">{obs.content}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {pdpModalOpen && selectedPlayer && (
        <PDPModal player={selectedPlayer} onClose={() => setPdpModalOpen(false)} />
      )}

      {/* Add Player Modal */}
      <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
        <DialogContent className="bg-[#181818] border border-gold rounded-xl p-8 w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gold">Add Player</DialogTitle>
          </DialogHeader>
          <Input className="mb-4 bg-[#222] border border-[#333] text-white" placeholder="Player Name" value={newPlayer} onChange={e => setNewPlayer(e.target.value)} />
          <DialogFooter>
            <button
              className="bg-gold text-black font-semibold px-6 py-2 rounded hover:bg-gold/80 transition w-full"
              onClick={handleAddPlayer}
              disabled={!newPlayer.trim() || addingPlayer}
            >
              {addingPlayer ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 