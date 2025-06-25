"use client";
import { useEffect, useState } from "react";
import AddPlayerModal from "./AddPlayerModal";
import { createClient } from "@/lib/supabase/client";

export default function TestAddPlayerPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = async () => {
    setLoading(true);
    const supabase = createClient();
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    // Get coach record
    const { data: coachRow } = await supabase
      .from('coaches')
      .select('id')
      .eq('auth_uid', user.id)
      .maybeSingle();
    if (!coachRow) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    // Get teams for this coach
    const { data: teamsData } = await supabase
      .from('teams')
      .select('id')
      .eq('coach_id', coachRow.id);
    const teamIds = (teamsData || []).map((t: any) => t.id);
    if (teamIds.length === 0) {
      setPlayers([]);
      setLoading(false);
      return;
    }
    // Get players for these teams
    const { data: playersData } = await supabase
      .from('players')
      .select('id, first_name, last_name, team_id')
      .in('team_id', teamIds);
    setPlayers(playersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Add Player Modal</h1>
      <AddPlayerModal onPlayerAdded={fetchPlayers} />
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Players</h2>
        {loading ? (
          <div>Loading...</div>
        ) : players.length === 0 ? (
          <div className="text-gray-400">No players found.</div>
        ) : (
          <ul className="space-y-2">
            {players.map((p) => (
              <li key={p.id} className="border border-[#d8cc97] rounded px-3 py-2 text-[#d8cc97] bg-[#181818]">
                {p.first_name} {p.last_name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 