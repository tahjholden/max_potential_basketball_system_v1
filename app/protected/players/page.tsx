import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function TableSection({ title, data, idField = "id" }) {
  if (!data || data.length === 0) {
    return <div className="mb-8"><h2 className="font-bold text-xl mb-2">{title}</h2><p>No records found.</p></div>;
  }
  return (
    <div className="mb-8">
      <h2 className="font-bold text-xl mb-2">{title}</h2>
      <ul className="space-y-6">
        {data.map((row) => (
          <li key={row[idField] || Math.random()} className="p-4 bg-accent rounded-md">
            <ul className="text-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
              {Object.entries(row).map(([field, value]) => (
                <li key={field}>
                  <span className="font-mono text-foreground/70">{field}:</span> {String(value)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function PlayersPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-red-500">{authError.message}</p>
        </div>
      );
    }
    if (!user) {
      redirect("/auth/login");
    }

    // Fetch all tables
    const [{ data: players, error: playersError },
           { data: coaches, error: coachesError },
           { data: observations, error: observationsError },
           { data: pdps, error: pdpsError }] = await Promise.all([
      supabase.from("players").select("*").order("last_name"),
      supabase.from("coaches").select("*").order("last_name"),
      supabase.from("observations").select("*").order("created_at", { ascending: false }),
      supabase.from("pdp").select("*").eq("archived", false).order("created_at", { ascending: false })
    ]);

    if (playersError || coachesError || observationsError || pdpsError) {
      return (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Error Loading Data</h1>
          <ul className="text-red-500">
            {playersError && <li>Players: {playersError.message}</li>}
            {coachesError && <li>Coaches: {coachesError.message}</li>}
            {observationsError && <li>Observations: {observationsError.message}</li>}
            {pdpsError && <li>PDPs: {pdpsError.message}</li>}
          </ul>
        </div>
      );
    }

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Database Records (All Fields)</h1>
        <TableSection title="Players" data={players} idField="id" />
        <TableSection title="Coaches" data={coaches} idField="id" />
        <TableSection title="Observations" data={observations} idField="id" />
        <TableSection title="PDPs" data={pdps} idField="id" />
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Unexpected Error</h1>
        <p className="text-red-500">Something went wrong: {(error as Error).message}</p>
      </div>
    );
  }
} 