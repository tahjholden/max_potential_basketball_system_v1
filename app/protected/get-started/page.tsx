"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchCoach() {
      setLoading(true);
      setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not authenticated. Please log in again.");
        router.push("/auth/login");
        return;
      }
      const { data: coachData, error: coachError } = await supabase
        .from("coaches")
        .select("*")
        .eq("auth_uid", user.id)
        .maybeSingle();
      if (coachError || !coachData) {
        setError("Coach record not found. Please contact support.");
        setLoading(false);
        return;
      }
      setCoach(coachData);
      setLoading(false);
    }
    fetchCoach();
  }, [router]);

  // 1. Create team
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!teamName.trim()) {
      setError("Team name is required");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("teams").insert([
      { name: teamName.trim(), org_id: coach.org_id, coach_id: coach.id }
    ]).select("id").single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep(2);
  }

  // 2. Create player
  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Fetch latest team for this org (simplest for MVP)
    const { data: teams, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("org_id", coach.org_id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (teamError || !teams || teams.length === 0) {
      setError("Team missing! Please create a team first.");
      setLoading(false);
      return;
    }
    const teamId = teams[0].id;
    if (!playerName.trim()) {
      setError("Player name is required");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("players").insert([
      { name: playerName.trim(), team_id: teamId, org_id: coach.org_id }
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStep(3);
  }

  // 3. Done!
  function handleFinish() {
    router.push("/protected/dashboard");
  }

  if (loading && !coach) return <div className="text-center py-16">Loading...</div>;
  if (error && !coach) return <div className="text-center py-16 text-red-400">{error}</div>;

  return (
    <div className="mx-auto max-w-lg p-8 bg-zinc-900 rounded-lg mt-16 shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-[#C2B56B]">Welcome to MP Player Development!</h1>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {step === 1 && (
        <form onSubmit={handleCreateTeam}>
          <label className="block mb-2 font-semibold text-zinc-200">Create Your First Team</label>
          <input
            type="text"
            className="w-full px-3 py-2 mb-4 rounded border border-zinc-700 bg-zinc-800 text-white"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            placeholder="Team name (e.g., MPBC 2033)"
            required
          />
          <button
            type="submit"
            className="bg-[#C2B56B] text-black font-bold px-5 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCreatePlayer}>
          <label className="block mb-2 font-semibold text-zinc-200">Add Your First Player</label>
          <input
            type="text"
            className="w-full px-3 py-2 mb-4 rounded border border-zinc-700 bg-zinc-800 text-white"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Player name"
            required
          />
          <button
            type="submit"
            className="bg-[#C2B56B] text-black font-bold px-5 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Player"}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center">
          <div className="text-green-400 text-xl mb-4 font-bold">You're all set!</div>
          <button
            onClick={handleFinish}
            className="bg-[#C2B56B] text-black font-bold px-5 py-2 rounded w-full"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
} 