import { createClient } from "@/lib/supabase/server";

export default async function PlayersPage() {
  const supabase = await createClient();
  const { data: players, error } = await supabase.from("players").select("*");

  if (error) return <div>Error: {error.message}</div>;
  if (!players) return <div>No players found.</div>;

  return (
    <div>
      <h1>Players</h1>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
} 