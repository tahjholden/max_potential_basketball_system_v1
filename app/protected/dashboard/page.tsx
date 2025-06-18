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

const BG = "#111";
const YELLOW = "#FFD600";
const CARD = "#222";

// DebugAuth component for debugging authentication state
function DebugAuth() {
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("Auth session:", data?.session);
      if (error) console.error("Session error:", error);
    });
    
    // Test user authentication
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("Current user:", data?.user);
      if (error) console.error("User error:", error);
    });
  }, []);
  return null;
}

export default function DashboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [pdps, setPdps] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [newPlayer, setNewPlayer] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [pdpModalOpen, setPdpModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add Player modal state
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [playerForm, setPlayerForm] = useState({ first_name: '', last_name: '', position: '' });
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);

  // Add Observation modal state
  const [addObsOpen, setAddObsOpen] = useState(false);
  const [obsForm, setObsForm] = useState({ player_id: '', content: '', observation_date: new Date().toISOString().slice(0, 10) });
  const [addObsError, setAddObsError] = useState<string | null>(null);
  const [addObsLoading, setAddObsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        // Fetch all data in parallel
        const [
          { data: playersData, error: playersError },
          { data: observationsData, error: observationsError },
          { data: pdpsData, error: pdpsError },
          { data: coachesData, error: coachesError }
        ] = await Promise.all([
          supabase.from("players").select("id, name"),
          supabase.from("observations").select("id, content, observation_date, created_at, player_id, player:player_id(name)").order("created_at", { ascending: false }),
          supabase.from("pdp").select("id, player_id, content, active"),
          supabase.from("coaches").select("id, first_name, last_name, email, is_admin, active")
        ]);

        console.log('Observations data:', observationsData);
        console.log('Observations error:', observationsError);

        // Check for errors
        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);
        if (pdpsError) throw new Error(`Error fetching PDPs: ${pdpsError.message}`);
        if (coachesError) throw new Error(`Error fetching coaches: ${coachesError.message}`);

        // Set data
        setPlayers(playersData || []);
        setObservations(observationsData || []);
        setPdps(pdpsData || []);
        setCoaches(coachesData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      }
    }

    fetchData();
  }, []);

  // Add Player handler
  async function handleAddPlayer() {
    setAddPlayerLoading(true);
    setAddPlayerError(null);
    
    try {
      const supabase = createClient();
      
      // First, check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("User auth error:", userError);
        setAddPlayerError(`Authentication error: ${userError.message}`);
        return;
      }
      
      if (!user) {
        console.error("No authenticated user found");
        setAddPlayerError("No authenticated user found. Please log in again.");
        return;
      }
      
      console.log("Authenticated user:", user);
      
      const { data, error } = await supabase.from('players').insert([
        {
          first_name: playerForm.first_name,
          last_name: playerForm.last_name,
          position: playerForm.position
        }
      ]).select();
      
      if (error) {
        console.error("Insert error:", error);
        setAddPlayerError(`Database error: ${error.message} (Code: ${error.code})`);
      } else {
        console.log("Player created successfully:", data);
        setPlayerForm({ first_name: '', last_name: '', position: '' });
        setAddPlayerOpen(false);
        // Refresh players
        const { data: players } = await supabase.from('players').select('*');
        setPlayers(players || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setAddPlayerError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddPlayerLoading(false);
    }
  }

  // Add Observation handler
  async function handleAddObservation() {
    setAddObsLoading(true);
    setAddObsError(null);
    const supabase = createClient();
    const { error } = await supabase.from('observations').insert([
      {
        player_id: obsForm.player_id,
        content: obsForm.content,
        observation_date: obsForm.observation_date
      }
    ]);
    setAddObsLoading(false);
    if (error) {
      setAddObsError(error.message);
    } else {
      setObsForm({ player_id: '', content: '', observation_date: new Date().toISOString().slice(0, 10) });
      setAddObsOpen(false);
      // Refresh observations
      const { data: observations } = await supabase.from('observations').select('*');
      setObservations(observations || []);
    }
  }

  const getPlayerObservations = (playerId: string) =>
    observations.filter((obs) => obs.player_id === playerId);

  const getPlayerPDP = (playerId: string) => pdps.find((pdp) => pdp.player_id === playerId);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <DebugAuth />
      <div className="p-4" style={{ backgroundColor: BG }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coaches Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Coaches</h2>
            {coaches.length > 0 ? (
              <table border={1} cellPadding={4} style={{ marginBottom: 8 }}>
                <thead>
                  <tr>
                    <th className="text-white">Name</th>
                    <th className="text-white">Email</th>
                    <th className="text-white">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className="text-white">{`${coach.first_name} ${coach.last_name}`}</td>
                      <td className="text-white">{coach.email}</td>
                      <td className="text-white">{coach.is_admin ? 'Admin' : 'Coach'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-white">No coaches found</div>
            )}
          </div>

          {/* Players Section */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white">Players</h2>
            {players.map((player) => {
              const playerObservations = getPlayerObservations(player.id);
              const playerPDP = getPlayerPDP(player.id);

              return (
                <div key={player.id} style={{ marginBottom: 32 }}>
                  <h3 className="text-white text-lg font-semibold mb-2">{player.name}</h3>
                  <div className="mb-2">
                    <span className="text-white font-bold">PDP:</span>
                    {playerPDP ? (
                      <div className="ml-2 inline-block text-white">
                        <span>{playerPDP.content}</span>
                        {playerPDP.active ? <span className="ml-2 text-green-400">(Active)</span> : null}
                      </div>
                    ) : <span className="ml-2 text-zinc-400">No PDP</span>}
                  </div>
                  <div className="text-white font-bold mb-1">Observations:</div>
                  {playerObservations.length > 0 ? (
                    <table border={1} cellPadding={4} style={{ marginBottom: 8, width: '100%' }}>
                      <thead>
                        <tr>
                          <th className="text-white">Player</th>
                          <th className="text-white">Date</th>
                          <th className="text-white">Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerObservations.map((obs) => (
                          <tr key={obs.id}>
                            <td className="text-white">{obs.player?.name || ''}</td>
                            <td className="text-white">{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : ''}</td>
                            <td className="text-white">{obs.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <div className="text-zinc-400 mb-4">No Observations</div>}
                </div>
              );
            })}
          </div>
        </div>
        {/* All Observations Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 text-white">All Observations</h2>
          {observations.length > 0 ? (
            <table border={1} cellPadding={4} style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="text-white">Player</th>
                  <th className="text-white">Date</th>
                  <th className="text-white">Content</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => (
                  <tr key={obs.id}>
                    <td className="text-white">{obs.player?.name || players.find(p => p.id === obs.player_id)?.name || ''}</td>
                    <td className="text-white">{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : ''}</td>
                    <td className="text-white">{obs.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-zinc-400">No observations found</div>
          )}
        </div>
        {pdpModalOpen && selectedPlayer && (
          <PDPModal player={selectedPlayer} onClose={() => setPdpModalOpen(false)} />
        )}
        <div className="flex gap-4 mb-4">
          <button className="bg-[#FFD600] text-black rounded px-4 py-2 font-bold" onClick={() => setAddPlayerOpen(true)}>Add Player</button>
          <button className="bg-[#FFD600] text-black rounded px-4 py-2 font-bold" onClick={() => setAddObsOpen(true)}>Add Observation</button>
        </div>
        {/* Add Player Modal */}
        {addPlayerOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">Add Player</div>
                <button className="ml-4 px-3 py-1 rounded bg-[#FFD600] text-black font-semibold" onClick={() => { setAddPlayerOpen(false); setAddPlayerError(null); }}>Close</button>
              </div>
              <input
                className="p-2 rounded mb-2 w-full text-black"
                placeholder="First Name"
                value={playerForm.first_name}
                onChange={e => setPlayerForm(f => ({ ...f, first_name: e.target.value }))}
              />
              <input
                className="p-2 rounded mb-2 w-full text-black"
                placeholder="Last Name"
                value={playerForm.last_name}
                onChange={e => setPlayerForm(f => ({ ...f, last_name: e.target.value }))}
              />
              <input
                className="p-2 rounded mb-4 w-full text-black"
                placeholder="Position (optional)"
                value={playerForm.position}
                onChange={e => setPlayerForm(f => ({ ...f, position: e.target.value }))}
              />
              {addPlayerError && <div className="text-red-500 mb-2">{addPlayerError}</div>}
              <button
                className="bg-[#FFD600] text-black rounded px-4 py-2 font-bold w-full disabled:opacity-60"
                onClick={handleAddPlayer}
                disabled={addPlayerLoading || !playerForm.first_name || !playerForm.last_name}
              >
                {addPlayerLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Add Observation Modal */}
        {addObsOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-800 p-8 rounded shadow-xl text-white max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">Add Observation</div>
                <button className="ml-4 px-3 py-1 rounded bg-[#FFD600] text-black font-semibold" onClick={() => { setAddObsOpen(false); setAddObsError(null); }}>Close</button>
              </div>
              <label className="block mb-1">Player</label>
              <select
                className="mb-2 p-2 w-full rounded text-black"
                value={obsForm.player_id}
                onChange={e => setObsForm(f => ({ ...f, player_id: e.target.value }))}
              >
                <option value="">Select a player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name ? `${p.first_name} ${p.last_name}` : p.name}
                  </option>
                ))}
              </select>
              <label className="block mb-1">Date</label>
              <input
                className="p-2 rounded mb-2 w-full text-black"
                type="date"
                value={obsForm.observation_date}
                onChange={e => setObsForm(f => ({ ...f, observation_date: e.target.value }))}
              />
              <label className="block mb-1">Observation</label>
              <textarea
                className="p-2 rounded mb-4 w-full text-black min-h-[80px]"
                placeholder="Observation details"
                value={obsForm.content}
                onChange={e => setObsForm(f => ({ ...f, content: e.target.value }))}
              />
              {addObsError && <div className="text-red-500 mb-2">{addObsError}</div>}
              <button
                className="bg-[#FFD600] text-black rounded px-4 py-2 font-bold w-full disabled:opacity-60"
                onClick={handleAddObservation}
                disabled={addObsLoading || !obsForm.player_id || !obsForm.content}
              >
                {addObsLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 