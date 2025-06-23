import { createClient } from "@/lib/supabase/client";
import { archiveAndCreateNewPDP as newArchiveAndCreateNewPDP } from "./archiveAndCreateNewPDP";

// DEPRECATED: Use the new archiveAndCreateNewPDP function from archiveAndCreateNewPDP.ts instead
// This function is kept for backward compatibility but will be removed in future versions
export async function archiveAndCreateNewPDP(playerId: string) {
  console.warn('DEPRECATED: Use the new archiveAndCreateNewPDP function from archiveAndCreateNewPDP.ts instead');
  
  const supabase = createClient();
  const now = new Date().toISOString();

  // 1. Get the active PDP (not archived)
  const { data: currentPDP, error: fetchError } = await supabase
    .from("pdp")
    .select("*")
    .eq("player_id", playerId)
    .is("archived_at", null)
    .single();

  if (fetchError || !currentPDP) {
    console.error("No active PDP found or error:", fetchError);
    return null;
  }

  // 2. Archive current PDP
  const archiveFields = {
    archived_at: now,
    end_date: now,
    updated_at: now,
  };

  const { error: archiveError } = await supabase
    .from("pdp")
    .update(archiveFields)
    .eq("id", currentPDP.id);

  if (archiveError) {
    console.error("Failed to archive PDP:", archiveError);
    return null;
  }

  // 3. Link all unlinked observations to the archived PDP
  const { error: linkObsError } = await supabase
    .from("observations")
    .update({ 
      pdp_id: currentPDP.id,
      archived_at: now 
    })
    .eq("player_id", playerId)
    .is("pdp_id", null);

  if (linkObsError) {
    console.error("Failed to link observations:", linkObsError);
    // Still proceed
  }

  // 4. Create new PDP
  const { data: newPDP, error: insertError } = await supabase
    .from("pdp")
    .insert({
      player_id: playerId,
      start_date: now,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to create new PDP:", insertError);
    return null;
  }

  return newPDP;
} 