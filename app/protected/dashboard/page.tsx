"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatCard } from "@/components/ui/stat-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PDPModal from "@/components/PDPModal";
import AddPDPModal from "./AddPDPModal";
import UpdatePDPModal from "./UpdatePDPModal";
import ObservationList from "./ObservationList";

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

  // Update PDP modal state
  const [updatePDPModalOpen, setUpdatePDPModalOpen] = useState(false);

  // Delete modal states
  const [deletePlayerModalOpen, setDeletePlayerModalOpen] = useState(false);
  const [deletePDPModalOpen, setDeletePDPModalOpen] = useState(false);
  const [deleteObservationModalOpen, setDeleteObservationModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [expandedPlayers, setExpandedPlayers] = useState<{[playerId: string]: boolean}>({});

  const [allPdps, setAllPdps] = useState<any[]>([]);

  // After fetching players and pdps, compute missing PDP count
  const missingPDPCount = players.filter((p: any) => p.pdpStatus === 'Missing').length;

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        // Fetch all data in parallel, including all PDPs (archived and not)
        const [
          { data: playersData, error: playersError },
          { data: observationsData, error: observationsError },
          { data: pdpsData, error: pdpsError },
          { data: allPdpsData, error: allPdpsError },
          { data: coachesData, error: coachesError }
        ] = await Promise.all([
          supabase.from("players").select("id, name, first_name, last_name"),
          supabase.from("observations").select("id, content, observation_date, created_at, player_id, pdp_id, player:player_id(name)").order("created_at", { ascending: false }),
          supabase.from("pdp").select("id, player_id, content, archived_at").is("archived_at", null), // Active PDPs
          supabase.from("pdp").select("id, player_id, content, archived_at"), // All PDPs
          supabase.from("coaches").select("id, first_name, last_name, email, is_admin, active")
        ]);

        // Check for errors
        if (playersError) throw new Error(`Error fetching players: ${playersError.message}`);
        if (observationsError) throw new Error(`Error fetching observations: ${observationsError.message}`);
        if (pdpsError) throw new Error(`Error fetching PDPs: ${pdpsError.message}`);
        if (allPdpsError) throw new Error(`Error fetching all PDPs: ${allPdpsError.message}`);
        if (coachesError) throw new Error(`Error fetching coaches: ${coachesError.message}`);

        setPlayers(playersData || []);
        setObservations(observationsData || []);
        setPdps(pdpsData || []);
        setAllPdps(allPdpsData || []);
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
  async function handleAddPlayer(playerData: { first_name: string; last_name: string; position?: string; pdpContent?: string }) {
    setAddPlayerLoading(true);
    setAddPlayerError(null);
    try {
      const supabase = createClient();
      // First, check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setAddPlayerError(`Authentication error: ${userError.message}`);
        return;
      }
      if (!user) {
        setAddPlayerError("No authenticated user found. Please log in again.");
        return;
      }
      // 1. Insert the player
      const { data: playerRows, error: playerError } = await supabase.from('players').insert([
        {
          first_name: playerData.first_name,
          last_name: playerData.last_name,
          position: playerData.position || '',
        }
      ]).select();
      if (playerError || !playerRows || !playerRows[0]) {
        setAddPlayerError(playerError?.message || 'Failed to create player');
        return;
      }
      const newPlayer = playerRows[0];
      // 2. If PDP content provided, archive all existing PDPs and create a new one
      if (playerData.pdpContent) {
        // Get coach record for current user
        const { data: coachData, error: coachError } = await supabase
          .from('coaches')
          .select('id')
          .eq('auth_uid', user.id)
          .single();
        
        if (coachError || !coachData) {
          setAddPlayerError("Player created, but coach record not found for PDP creation.");
          return;
        }
        
        // Archive all existing PDPs for this player (should be none, but future-proof)
        await supabase.from('pdp').update({ archived_at: new Date().toISOString(), end_date: new Date().toISOString() }).eq('player_id', newPlayer.id).is("archived_at", null);
        // Insert new PDP
        const { error: pdpError } = await supabase.from('pdp').insert([
          {
            player_id: newPlayer.id,
            content: playerData.pdpContent,
            archived_at: null, // Active PDP
            start_date: new Date().toISOString(),
            end_date: null,
            coach_id: coachData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        if (pdpError) {
          setAddPlayerError(`Player created, but failed to create initial PDP: ${pdpError.message}`);
        }
      }
      setPlayerForm({ first_name: '', last_name: '', position: '' });
      setAddPlayerOpen(false);
      // Refresh players and pdps
      const [{ data: players }, { data: pdps }] = await Promise.all([
        supabase.from('players').select('id, name, first_name, last_name'),
        supabase.from('pdp').select('*').eq("archived_at", null)
      ]);
      setPlayers(players || []);
      setPdps(pdps || []);
    } catch (err) {
      setAddPlayerError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddPlayerLoading(false);
    }
  }

  // Add Observation handler
  async function handleAddObservation() {
    setAddObsLoading(true);
    setAddObsError(null);
    try {
      const supabase = createClient();
      
      // Get the current active PDP for this player
      const { data: activePDP, error: pdpError } = await supabase
        .from('pdp')
        .select('id')
        .eq('player_id', obsForm.player_id)
        .eq('archived_at', null)
        .single();
      
      if (pdpError && pdpError.code !== 'PGRST116') {
        setAddObsError(`Error finding active PDP: ${pdpError.message}`);
        setAddObsLoading(false);
        return;
      }
      
      // Insert observation with pdp_id (can be null if no active PDP)
      const { error } = await supabase.from('observations').insert([
        {
          player_id: obsForm.player_id,
          content: obsForm.content,
          observation_date: obsForm.observation_date,
          pdp_id: activePDP?.id || null
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
    } catch (err) {
      setAddObsLoading(false);
      setAddObsError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Add PDP handler
  async function handleAddPDP(pdpData: { player_id: string; content: string; start_date: string }) {
    setAddPlayerLoading(true);
    setAddPlayerError(null);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setAddPlayerError(`Authentication error: ${userError.message}`);
        return;
      }
      if (!user) {
        setAddPlayerError("No authenticated user found. Please log in again.");
        return;
      }
      
      // Get coach record for current user
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_uid', user.id)
        .single();
      
      if (coachError || !coachData) {
        setAddPlayerError("Coach record not found. Please contact an administrator.");
        return;
      }
      
      // 1. Archive all current PDPs for this player
      await supabase.from('pdp').update({ archived_at: new Date().toISOString(), end_date: new Date().toISOString() }).eq('player_id', pdpData.player_id).is("archived_at", null);
      // 2. Insert new PDP
      const { error: pdpError } = await supabase.from('pdp').insert([
        {
          player_id: pdpData.player_id,
          content: pdpData.content,
          archived_at: null, // Active PDP
          start_date: pdpData.start_date,
          end_date: null,
          coach_id: coachData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      if (pdpError) {
        setAddPlayerError(`Failed to create PDP: ${pdpError.message}`);
      }
      setPdpModalOpen(false);
      // Refresh pdps
      const { data: pdps } = await supabase.from('pdp').select('*').is("archived_at", null);
      setPdps(pdps || []);
    } catch (err) {
      setAddPlayerError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddPlayerLoading(false);
    }
  }

  // Update PDP handler (same logic as Add PDP)
  async function handleUpdatePDP(player: any, pdpData: { content: string; start_date: string }) {
    setAddPlayerLoading(true);
    setAddPlayerError(null);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setAddPlayerError(`Authentication error: ${userError.message}`);
        return;
      }
      if (!user) {
        setAddPlayerError("No authenticated user found. Please log in again.");
        return;
      }
      
      // Get coach record for current user
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('auth_uid', user.id)
        .single();
      
      if (coachError || !coachData) {
        setAddPlayerError("Coach record not found. Please contact an administrator.");
        return;
      }
      
      // 1. Archive all current PDPs for this player
      await supabase.from('pdp').update({ archived_at: new Date().toISOString(), end_date: new Date().toISOString() }).eq('player_id', player.id).is("archived_at", null);
      // 2. Insert new PDP
      const { error: pdpError } = await supabase.from('pdp').insert([
        {
          player_id: player.id,
          content: pdpData.content,
          archived_at: null, // Active PDP
          start_date: pdpData.start_date,
          end_date: null,
          coach_id: coachData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      if (pdpError) {
        setAddPlayerError(`Failed to update PDP: ${pdpError.message}`);
      }
      setUpdatePDPModalOpen(false);
      // Refresh pdps
      const { data: pdps } = await supabase.from('pdp').select('*').is("archived_at", null);
      setPdps(pdps || []);
    } catch (err) {
      setAddPlayerError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setAddPlayerLoading(false);
    }
  }

  const getPlayerPDP = (playerId: string) => pdps.find((pdp) => pdp.player_id === playerId);
  const getPlayerObservations = (playerId: string) =>
    observations.filter((obs) => obs.player_id === playerId);

  // Delete Player handler
  async function handleDeletePlayer(player: any) {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('players').delete().eq('id', player.id);
      if (error) {
        setDeleteError(`Failed to delete player: ${error.message}`);
        return;
      }
      setDeletePlayerModalOpen(false);
      setItemToDelete(null);
      // Refresh players, observations, and pdps
      const [{ data: players }, { data: observations }, { data: pdps }] = await Promise.all([
        supabase.from('players').select('id, name, first_name, last_name'),
        supabase.from('observations').select('*'),
        supabase.from('pdp').select('*').is("archived_at", null)
      ]);
      setPlayers(players || []);
      setObservations(observations || []);
      setPdps(pdps || []);
    } catch (err) {
      setDeleteError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Delete PDP handler
  async function handleDeletePDP(pdp: any) {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('pdp').delete().eq('id', pdp.id);
      if (error) {
        setDeleteError(`Failed to delete PDP: ${error.message}`);
        return;
      }
      setDeletePDPModalOpen(false);
      setItemToDelete(null);
      // Refresh pdps
      const { data: pdps } = await supabase.from('pdp').select('*').is("archived_at", null);
      setPdps(pdps || []);
    } catch (err) {
      setDeleteError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Delete Observation handler
  async function handleDeleteObservation(observation: any) {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('observations').delete().eq('id', observation.id);
      if (error) {
        setDeleteError(`Failed to delete observation: ${error.message}`);
        return;
      }
      setDeleteObservationModalOpen(false);
      setItemToDelete(null);
      // Refresh observations
      const { data: observations } = await supabase.from('observations').select('*');
      setObservations(observations || []);
    } catch (err) {
      setDeleteError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Only allow Add PDP for players with no PDPs (current or archived)
  const eligiblePlayersForPDP = players.filter(
    (player) => !allPdps.some((pdp) => pdp.player_id === player.id)
  );

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
      <div className="bg-[#0f172a] text-white min-h-screen font-sans p-6">
        {/* Main grid for players and observations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Players List (narrow, left) */}
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-md border border-slate-700 col-span-1">
            <h2 className="text-lg text-gold font-semibold mb-4">Players</h2>
            <ul className="space-y-2">
              {players.map((player) => {
                const playerObservations = observations.filter((obs) => obs.player_id === player.id);
                const playerPDP = pdps.find((pdp) => pdp.player_id === player.id);
                const showAll = expandedPlayers[player.id] || false;
                const obsToShow = showAll ? playerObservations : playerObservations.slice(0, 3);
                return (
                  <li key={player.id} className="">
                    <details className="group">
                      <summary className="cursor-pointer text-white hover:text-gold transition font-semibold py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-gold">
                        {player.first_name && player.last_name ? `${player.first_name} ${player.last_name}` : player.name || `Player ${player.id}`}
                      </summary>
                      <div className="mt-2 ml-2 border-l-2 border-gold pl-4 text-sm text-gray-200">
                        <div className="mb-2">
                          <span className="text-gray-400">PDP:</span> {playerPDP ? <span className="text-white">{playerPDP.content}</span> : <span className="text-gray-500">No PDP</span>}
                        </div>
                        <div className="mb-2">
                          <span className="text-gray-400">Recent Observations:</span>
                          <ul className="mt-1 space-y-1">
                            {obsToShow.map((obs) => (
                              <li key={obs.id} className="bg-slate-800 p-2 rounded border border-slate-700">
                                <div className="text-xs text-gold mb-1">{obs.observation_date ? new Date(obs.observation_date).toLocaleDateString() : 'No date'}</div>
                                <div className="text-gray-100 text-xs">{obs.content}</div>
                              </li>
                            ))}
                          </ul>
                          {playerObservations.length > 3 && !showAll && (
                            <button
                              className="mt-2 text-gold text-xs underline hover:text-gold/80"
                              onClick={(e) => { e.preventDefault(); setExpandedPlayers(prev => ({ ...prev, [player.id]: true })); }}
                            >
                              See more
                            </button>
                          )}
                          {playerObservations.length > 3 && showAll && (
                            <button
                              className="mt-2 text-gold text-xs underline hover:text-gold/80"
                              onClick={(e) => { e.preventDefault(); setExpandedPlayers(prev => ({ ...prev, [player.id]: false })); }}
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Observations Section (wide, right) */}
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-md border border-slate-700 col-span-2">
            <h2 className="text-lg text-gold font-semibold mb-4">All Observations</h2>
            <ObservationList observations={observations} players={players} />
          </div>
        </div>
        {pdpModalOpen && selectedPlayer && (
          <PDPModal player={selectedPlayer} onClose={() => setPdpModalOpen(false)} />
        )}
        {/* Control Buttons Section */}
        <div className="bg-[#1e293b] p-6 rounded-lg shadow-md border border-slate-700 mb-8">
          <h2 className="text-lg text-gold font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              className="bg-gold text-black rounded px-4 py-2 font-bold hover:bg-gold/80 transition-colors" 
              onClick={() => setAddPlayerOpen(true)}
            >
              Add Player
            </button>
            <button 
              className="bg-gold text-black rounded px-4 py-2 font-bold hover:bg-gold/80 transition-colors" 
              onClick={() => setAddObsOpen(true)}
            >
              Add Observation
            </button>
            <button 
              className="bg-gold text-black rounded px-4 py-2 font-bold hover:bg-gold/80 transition-colors" 
              onClick={() => setPdpModalOpen(true)}
            >
              Add PDP
            </button>
            <button 
              className="bg-gold text-black rounded px-4 py-2 font-bold hover:bg-gold/80 transition-colors" 
              onClick={() => setUpdatePDPModalOpen(true)}
            >
              Update PDP
            </button>
            <button 
              className="bg-accent text-white rounded px-4 py-2 font-bold hover:bg-accent/80 transition-colors" 
              onClick={() => setDeletePlayerModalOpen(true)}
            >
              Delete Player
            </button>
            <button 
              className="bg-accent text-white rounded px-4 py-2 font-bold hover:bg-accent/80 transition-colors" 
              onClick={() => setDeletePDPModalOpen(true)}
            >
              Delete PDP
            </button>
            <button 
              className="bg-accent text-white rounded px-4 py-2 font-bold hover:bg-accent/80 transition-colors" 
              onClick={() => setDeleteObservationModalOpen(true)}
            >
              Delete Observation
            </button>
          </div>
        </div>
        {/* Add Player Modal */}
        {addPlayerOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg text-gold font-semibold">Add Player</div>
                <button 
                  className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors" 
                  onClick={() => { setAddPlayerOpen(false); setAddPlayerError(null); }}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Enter first name"
                    value={playerForm.first_name}
                    onChange={e => setPlayerForm(f => ({ ...f, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Enter last name"
                    value={playerForm.last_name}
                    onChange={e => setPlayerForm(f => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position (optional)</label>
                  <input
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    placeholder="Enter position"
                    value={playerForm.position}
                    onChange={e => setPlayerForm(f => ({ ...f, position: e.target.value }))}
                  />
                </div>
                {addPlayerError && (
                  <div className="p-3 bg-accent/20 border border-accent rounded text-accent text-sm">
                    {addPlayerError}
                  </div>
                )}
                <button
                  className="w-full bg-gold text-black rounded px-4 py-3 font-bold hover:bg-gold/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => handleAddPlayer(playerForm)}
                  disabled={addPlayerLoading || !playerForm.first_name || !playerForm.last_name}
                >
                  {addPlayerLoading ? "Saving..." : "Save Player"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Observation Modal */}
        {addObsOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg text-gold font-semibold">Add Observation</div>
                <button 
                  className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors" 
                  onClick={() => { setAddObsOpen(false); setAddObsError(null); }}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Player</label>
                  <select
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    type="date"
                    value={obsForm.observation_date}
                    onChange={e => setObsForm(f => ({ ...f, observation_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Observation</label>
                  <textarea
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors min-h-[100px] resize-none"
                    placeholder="Enter observation details"
                    value={obsForm.content}
                    onChange={e => setObsForm(f => ({ ...f, content: e.target.value }))}
                  />
                </div>
                {addObsError && (
                  <div className="p-3 bg-accent/20 border border-accent rounded text-accent text-sm">
                    {addObsError}
                  </div>
                )}
                <button
                  className="w-full bg-gold text-black rounded px-4 py-3 font-bold hover:bg-gold/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={handleAddObservation}
                  disabled={addObsLoading || !obsForm.player_id || !obsForm.content}
                >
                  {addObsLoading ? "Saving..." : "Save Observation"}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Add PDP Modal */}
        {pdpModalOpen && (
          <AddPDPModal
            open={pdpModalOpen}
            onClose={() => setPdpModalOpen(false)}
            onSubmit={handleAddPDP}
            players={eligiblePlayersForPDP}
            selectedPlayer={selectedPlayer}
            currentUser={coaches.find((c) => c.auth_uid === selectedPlayer?.auth_uid)}
          />
        )}
        {/* Update PDP Modal */}
        <UpdatePDPModal
          open={updatePDPModalOpen}
          onClose={() => setUpdatePDPModalOpen(false)}
          onSubmit={handleUpdatePDP}
          player={selectedPlayer}
          players={players}
          currentUser={coaches.find((c) => c.auth_uid === selectedPlayer?.auth_uid)}
        />

        {/* Delete Player Modal */}
        {deletePlayerModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg text-gold font-semibold">Delete Player</div>
                <button 
                  className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors" 
                  onClick={() => { setDeletePlayerModalOpen(false); setDeleteError(null); setItemToDelete(null); }}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Player to Delete</label>
                  <select
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    value={itemToDelete?.id || ""}
                    onChange={e => {
                      const player = players.find(p => p.id === e.target.value);
                      setItemToDelete(player || null);
                    }}
                  >
                    <option value="">Select a player</option>
                    {players.map((player: any) => (
                      <option key={player.id} value={player.id}>
                        {player.first_name && player.last_name 
                          ? `${player.first_name} ${player.last_name}` 
                          : player.name || `Player ${player.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                {itemToDelete && (
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded">
                    <p className="text-red-300 text-sm mb-2">
                      <strong>Warning:</strong> This will permanently delete the player and all associated data.
                    </p>
                    <div className="text-white text-sm space-y-1">
                      <p><strong>Name:</strong> {itemToDelete.first_name && itemToDelete.last_name 
                        ? `${itemToDelete.first_name} ${itemToDelete.last_name}` 
                        : itemToDelete.name || `Player ${itemToDelete.id}`}</p>
                      <p><strong>Position:</strong> {itemToDelete.position || 'Not specified'}</p>
                    </div>
                  </div>
                )}
                {deleteError && (
                  <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-300 text-sm">
                    {deleteError}
                  </div>
                )}
                <button
                  className="w-full bg-accent text-white rounded px-4 py-3 font-bold hover:bg-accent/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => itemToDelete && handleDeletePlayer(itemToDelete)}
                  disabled={deleteLoading || !itemToDelete}
                >
                  {deleteLoading ? "Deleting..." : "Delete Player"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete PDP Modal */}
        {deletePDPModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg text-gold font-semibold">Delete PDP</div>
                <button 
                  className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors" 
                  onClick={() => { setDeletePDPModalOpen(false); setDeleteError(null); setItemToDelete(null); }}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select PDP to Delete</label>
                  <select
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    value={itemToDelete?.id || ""}
                    onChange={e => {
                      const pdp = pdps.find(p => p.id === e.target.value);
                      setItemToDelete(pdp || null);
                    }}
                  >
                    <option value="">Select a PDP</option>
                    {pdps.map((pdp: any) => {
                      const player = players.find(p => p.id === pdp.player_id);
                      const playerName = player ? (player.first_name && player.last_name 
                        ? `${player.first_name} ${player.last_name}` 
                        : player.name || `Player ${player.id}`) : 'Unknown Player';
                      return (
                        <option key={pdp.id} value={pdp.id}>
                          {playerName} - {pdp.content.substring(0, 50)}{pdp.content.length > 50 ? '...' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {itemToDelete && (
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded">
                    <p className="text-red-300 text-sm mb-2">
                      <strong>Warning:</strong> This will permanently delete the selected PDP.
                    </p>
                    <div className="text-white text-sm space-y-1">
                      <p><strong>Player:</strong> {(() => {
                        const player = players.find(p => p.id === itemToDelete.player_id);
                        return player ? (player.first_name && player.last_name 
                          ? `${player.first_name} ${player.last_name}` 
                          : player.name || `Player ${player.id}`) : 'Unknown Player';
                      })()}</p>
                      <p><strong>Content:</strong> {itemToDelete.content}</p>
                    </div>
                  </div>
                )}
                {deleteError && (
                  <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-300 text-sm">
                    {deleteError}
                  </div>
                )}
                <button
                  className="w-full bg-accent text-white rounded px-4 py-3 font-bold hover:bg-accent/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => itemToDelete && handleDeletePDP(itemToDelete)}
                  disabled={deleteLoading || !itemToDelete}
                >
                  {deleteLoading ? "Deleting..." : "Delete PDP"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Observation Modal */}
        {deleteObservationModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl text-white max-w-md w-full border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div className="text-lg text-gold font-semibold">Delete Observation</div>
                <button 
                  className="px-3 py-1 rounded bg-gold text-black font-semibold hover:bg-gold/80 transition-colors" 
                  onClick={() => { setDeleteObservationModalOpen(false); setDeleteError(null); setItemToDelete(null); }}
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Observation to Delete</label>
                  <select
                    className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-gold focus:outline-none transition-colors"
                    value={itemToDelete?.id || ""}
                    onChange={e => {
                      const observation = observations.find(o => o.id === e.target.value);
                      setItemToDelete(observation || null);
                    }}
                  >
                    <option value="">Select an observation</option>
                    {observations.map((observation: any) => {
                      const player = players.find(p => p.id === observation.player_id);
                      const playerName = player ? (player.first_name && player.last_name 
                        ? `${player.first_name} ${player.last_name}` 
                        : player.name || `Player ${player.id}`) : 'Unknown Player';
                      const date = observation.observation_date ? new Date(observation.observation_date).toLocaleDateString() : 'No date';
                      return (
                        <option key={observation.id} value={observation.id}>
                          {playerName} - {date} - {observation.content.substring(0, 40)}{observation.content.length > 40 ? '...' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                {itemToDelete && (
                  <div className="p-4 bg-red-900/20 border border-red-500 rounded">
                    <p className="text-red-300 text-sm mb-2">
                      <strong>Warning:</strong> This will permanently delete the selected observation.
                    </p>
                    <div className="text-white text-sm space-y-1">
                      <p><strong>Player:</strong> {(() => {
                        const player = players.find(p => p.id === itemToDelete.player_id);
                        return player ? (player.first_name && player.last_name 
                          ? `${player.first_name} ${player.last_name}` 
                          : player.name || `Player ${player.id}`) : 'Unknown Player';
                      })()}</p>
                      <p><strong>Date:</strong> {itemToDelete.observation_date ? new Date(itemToDelete.observation_date).toLocaleDateString() : 'No date'}</p>
                      <p><strong>Content:</strong> {itemToDelete.content}</p>
                    </div>
                  </div>
                )}
                {deleteError && (
                  <div className="p-3 bg-red-900/20 border border-red-500 rounded text-red-300 text-sm">
                    {deleteError}
                  </div>
                )}
                <button
                  className="w-full bg-accent text-white rounded px-4 py-3 font-bold hover:bg-accent/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  onClick={() => itemToDelete && handleDeleteObservation(itemToDelete)}
                  disabled={deleteLoading || !itemToDelete}
                >
                  {deleteLoading ? "Deleting..." : "Delete Observation"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gold text-black font-bold py-4 rounded-lg shadow text-center">
            <div className="text-3xl">{missingPDPCount}</div>
            <div className="text-sm">Players Missing PDP</div>
          </div>
        </div>
      </div>
    </>
  );
} 