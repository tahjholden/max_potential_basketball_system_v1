import { createClient } from "@supabase/supabase-js"

// WARNING: Do NOT use this singleton for authenticated actions. Use createClient() from @/lib/supabase/client for anything requiring user authentication/session.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getDashboardData() {
  const [{ data: players, error: playerErr }, { data: observations, error: obsErr }, { data: pdps, error: pdpErr }] = await Promise.all([
    supabase.from("players").select("id, name"),
    supabase.from("observations").select("id, player_id, content, observation_date"),
    supabase.from("pdp").select("id, player_id, content, start_date, end_date, active")
  ])

  if (playerErr || obsErr || pdpErr) {
    console.error("Supabase fetch error:", { playerErr, obsErr, pdpErr })
    return { players: [], observations: [], pdps: [] }
  }

  return {
    players: players || [],
    observations: observations || [],
    pdps: pdps || []
  }
} 