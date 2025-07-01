import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import PlayerDetailClient from "./PlayerDetailClient";

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { data: player } = await supabase
    .from("players")
    .select("id, name, first_name, last_name, created_at, updated_at")
    .eq("id", params.id)
    .single();

  if (!player) {
    notFound();
  }

  const { data: currentPDP } = await supabase
    .from("pdp")
    .select("id, content, start_date")
    .eq("player_id", params.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: recentObservations } = await supabase
    .from("observations")
    .select("id, content, observation_date, coaches(first_name, last_name)")
    .eq("player_id", params.id)
    .order("created_at", { ascending: false })
    .limit(15);
  
  const { data: coach } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_uid', user.id)
    .single();

  const { data: archivedPDPs } = await supabase
    .from("pdp")
    .select("id, content, start_date, archived_at")
    .eq("player_id", params.id)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });

  return (
    <PlayerDetailClient 
      player={player}
      currentPDP={currentPDP}
      recentObservations={recentObservations || []}
      archivedPDPs={archivedPDPs || []}
      coach={coach}
    />
  );
} 