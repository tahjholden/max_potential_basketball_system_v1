"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  org_id: string;
  team_id?: string;
  teams?: {
    id: string;
    name: string;
    coach_id: string;
  };
}

interface PDP {
  id: string;
  player_id: string;
  content: string;
  start_date: string;
  archived_at?: string;
  created_at: string;
}

interface Observation {
  id: string;
  content: string;
  observation_date: string;
  pdp_id: string;
  archived: boolean;
  created_at: string;
}

export default function SimplePDPArchivingTest() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [currentPDP, setCurrentPDP] = useState<PDP | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    // Get players with their team information
    const { data: playersData } = await supabase
      .from('players')
      .select(`
        *,
        teams!inner (
          id,
          name,
          coach_id
        )
      `)
      .limit(10);
    
    if (playersData) {
      setPlayers(playersData);
      if (playersData.length > 0) {
        setSelectedPlayer(playersData[0]);
      }
    }
  };

  const fetchPlayerData = async (playerId: string) => {
    const supabase = createClient();
    
    // Get current PDP
    const { data: pdpData } = await supabase
      .from('pdp')
      .select('*')
      .eq('player_id', playerId)
      .is('archived_at', null)
      .maybeSingle();
    
    setCurrentPDP(pdpData);

    // Get observations
    const { data: obsData } = await supabase
      .from('observations')
      .select('*')
      .eq('player_id', playerId)
      .eq('archived', false);
    
    setObservations(obsData || []);
  };

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerData(selectedPlayer.id);
    }
  }, [selectedPlayer]);

  const addResult = (message: string) => {
    setResults(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 9)]);
  };

  // Simple archive test
  const testSimpleArchive = async () => {
    if (!selectedPlayer || !currentPDP) {
      toast.error("Please select a player with an active PDP first");
      return;
    }

    setLoading(true);
    try {
      addResult("Testing simple archive process...");
      
      const supabase = createClient();
      const now = new Date().toISOString();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addResult("❌ User not authenticated");
        toast.error("User not authenticated");
        return;
      }

      // 1. Archive the current PDP
      const { error: pdpError } = await supabase
        .from('pdp')
        .update({
          archived_at: now,
          updated_at: now
        })
        .eq('id', currentPDP.id);

      if (pdpError) {
        addResult(`❌ PDP archive error: ${pdpError.message}`);
        throw pdpError;
      }

      addResult("✅ PDP archived successfully");

      // 2. Archive all observations for this player
      const { error: obsError } = await supabase
        .from('observations')
        .update({
          archived: true,
          updated_at: now
        })
        .eq('player_id', selectedPlayer.id)
        .eq('archived', false);

      if (obsError) {
        addResult(`❌ Observations archive error: ${obsError.message}`);
        throw obsError;
      }

      addResult("✅ Observations archived successfully");

      // 3. Create a new PDP
      const { data: newPDP, error: createError } = await supabase
        .from('pdp')
        .insert({
          player_id: selectedPlayer.id,
          org_id: selectedPlayer.org_id,
          content: `New development plan created at ${now}`,
          start_date: now,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (createError) {
        addResult(`❌ New PDP creation error: ${createError.message}`);
        throw createError;
      }

      addResult("✅ New PDP created successfully");
      toast.success("Archive and create process completed successfully");
      
      // Refresh data
      fetchPlayerData(selectedPlayer.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addResult(`❌ Archive process error: ${errorMsg}`);
      toast.error(`Archive process error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Create test data
  const createTestData = async () => {
    if (!selectedPlayer) {
      toast.error("Please select a player first");
      return;
    }

    setLoading(true);
    try {
      addResult("Creating test PDP and observations...");
      
      const supabase = createClient();
      const now = new Date().toISOString();

      // Create a new PDP
      const { data: newPDP, error: pdpError } = await supabase
        .from('pdp')
        .insert({
          player_id: selectedPlayer.id,
          org_id: selectedPlayer.org_id,
          content: `Test PDP created at ${now}`,
          start_date: now,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (pdpError) throw pdpError;

      // Create test observations
      const testObservations = [
        { content: "Test observation 1", observation_date: now },
        { content: "Test observation 2", observation_date: now },
        { content: "Test observation 3", observation_date: now }
      ];

      for (const obs of testObservations) {
        const { error: obsError } = await supabase
          .from('observations')
          .insert({
            player_id: selectedPlayer.id,
            pdp_id: newPDP.id,
            content: obs.content,
            observation_date: obs.observation_date,
            created_at: now,
            updated_at: now
          });

        if (obsError) throw obsError;
      }

      addResult("✅ Test data created successfully");
      toast.success("Test data created");
      fetchPlayerData(selectedPlayer.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      addResult(`❌ Test data creation error: ${errorMsg}`);
      toast.error(`Test data creation error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[#C2B56B]">Simple PDP Archiving Test</h1>
      
      {/* Player Selection */}
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-white">Player Selection</h2>
        <select 
          value={selectedPlayer?.id || ""} 
          onChange={(e) => {
            const player = players.find(p => p.id === e.target.value);
            setSelectedPlayer(player || null);
          }}
          className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded text-white"
        >
          <option value="">Select a player...</option>
          {players.map(player => (
            <option key={player.id} value={player.id}>
              {player.first_name} {player.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Current State Display */}
      {selectedPlayer && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Current PDP</h3>
            {currentPDP ? (
              <div className="text-sm text-zinc-300">
                <p><strong>ID:</strong> {currentPDP.id}</p>
                <p><strong>Started:</strong> {new Date(currentPDP.start_date).toLocaleDateString()}</p>
                <p><strong>Content:</strong> {currentPDP.content?.substring(0, 50)}...</p>
              </div>
            ) : (
              <p className="text-zinc-400 italic">No active PDP</p>
            )}
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Active Observations</h3>
            <p className="text-sm text-zinc-300">
              <strong>Count:</strong> {observations.length}
            </p>
            {observations.slice(0, 3).map(obs => (
              <p key={obs.id} className="text-xs text-zinc-400 mt-1">
                {obs.content.substring(0, 30)}...
              </p>
            ))}
          </div>
          
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Team Info</h3>
            {selectedPlayer.teams ? (
              <div className="text-sm text-zinc-300">
                <p><strong>Team:</strong> {selectedPlayer.teams.name}</p>
                <p><strong>Team Coach ID:</strong> {selectedPlayer.teams.coach_id}</p>
                <p><strong>Current User ID:</strong> {currentUser?.id}</p>
                <p><strong>Can Create PDP:</strong> {selectedPlayer.teams.coach_id === currentUser?.id ? '✅ Yes' : '❌ No'}</p>
              </div>
            ) : (
              <p className="text-zinc-400 italic">No team info</p>
            )}
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={createTestData}
          disabled={loading || !selectedPlayer}
          className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Create Test Data
        </button>
        
        <button
          onClick={testSimpleArchive}
          disabled={loading || !selectedPlayer || !currentPDP}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Test Simple Archive
        </button>
      </div>

      {/* Results Log */}
      <div className="mb-6 p-4 bg-zinc-900 rounded-lg">
        <h3 className="font-semibold text-white mb-3">Test Results Log</h3>
        <div className="h-64 overflow-y-auto bg-black p-3 rounded text-sm font-mono">
          {results.length === 0 ? (
            <p className="text-zinc-500 italic">No test results yet. Run a test to see results here.</p>
          ) : (
            results.map((result, index) => (
              <div key={index} className="text-zinc-300 mb-1">
                {result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 