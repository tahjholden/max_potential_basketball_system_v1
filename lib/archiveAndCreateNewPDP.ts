import { createClient } from '@/lib/supabase/client'
import { supabase } from "@/lib/supabase";

// Define types based on your database schema
type Pdp = {
  id: string;
  player_id: string;
  coach_id?: string;
  content: string;
  start_date: string;
  archived_at?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
};

type Observation = {
  id: string;
  player_id: string;
  pdp_id?: string;
  content: string;
  observation_date: string;
  created_at: string;
  archived_at?: string;
};

export async function archiveAndCreateNewPDP({
  currentPdp,
  playerId,
  newContent,
}: {
  currentPdp: Pdp | null;
  playerId: string;
  newContent: string;
}): Promise<{ success: boolean; data?: Pdp; error?: string }> {
  const supabase = createClient()
  const now = new Date().toISOString()

  try {
    // 1. Get coach_id from auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: coachData, error: coachError } = await supabase
      .from("coaches")
      .select("id")
      .eq("auth_uid", user.id)
      .single()

    if (coachError || !coachData) {
      return { success: false, error: "Coach not found" }
    }

    const coachId = coachData.id

    // 2. Archive current PDP (if it exists)
    if (currentPdp) {
      // 1. Archive the PDP
      await supabase
        .from("pdp")
        .update({
          archived_at: now,
          end_date: now,
          updated_at: now,
        })
        .eq("id", currentPdp.id);

      // 2. Archive related observations
      await supabase
        .from("observations")
        .update({ archived_at: now })
        .eq("pdp_id", currentPdp.id)
        .is("archived_at", null);
    }

    // 4. Create new PDP
    const { data: newPdp, error: insertError } = await supabase
      .from("pdp")
      .insert({
        player_id: playerId,
        coach_id: coachId,
        content: newContent,
        start_date: now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    return { success: true, data: newPdp }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

// Step 2: Create new PDP (only after archiving is complete)
export async function createNewPDP(
  playerId: string, 
  content: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const now = new Date().toISOString()

  try {
    console.log('Starting create new PDP process for player:', playerId)
    
    // Verify no active PDP exists (archiving must be complete)
    const { data: activePdp, error: checkError } = await supabase
      .from('pdp')
      .select('id')
      .eq('player_id', playerId)
      .is('archived_at', null)
      .single()

    console.log('Check for active PDP result:', { activePdp, checkError })

    // If there's no error and we found an active PDP, that's a problem
    if (!checkError && activePdp) {
      console.log('❌ Active PDP still exists:', activePdp)
      return { success: false, error: 'An active PDP still exists. Please archive it first.' }
    }

    // If there's an error but it's PGRST116 (no rows), that's expected
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ No active PDP found (expected) - proceeding to create new one')
    } else if (checkError) {
      console.log('❌ Unexpected error checking for active PDP:', checkError)
      return { success: false, error: `Error checking for active PDP: ${checkError.message}` }
    }

    console.log('✅ No active PDP found, proceeding to create new one')

    // Create new PDP with the provided content
    const newPdpData = {
      player_id: playerId,
      start_date: now,
      content: content,
      created_at: now,
      updated_at: now,
      // archived_at is null by default, making this the new active PDP
    }

    console.log('📝 Inserting new PDP with data:', newPdpData)

    const { data: newPdp, error: insertError } = await supabase
      .from('pdp')
      .insert(newPdpData)
      .select()

    if (insertError) {
      console.log('❌ Error inserting new PDP:', insertError)
      return { success: false, error: `Error creating new PDP: ${insertError.message}` }
    }

    console.log('✅ New PDP created successfully:', newPdp)

    // Verify the new PDP was created and is now the active one
    const { data: verifyPdp, error: verifyError } = await supabase
      .from('pdp')
      .select('*')
      .eq('player_id', playerId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (verifyError) {
      console.log('❌ Error verifying new PDP:', verifyError)
      return { success: false, error: `Error verifying new PDP: ${verifyError.message}` }
    }

    console.log('✅ New PDP verified as active:', verifyPdp)

    return { success: true }
  } catch (error) {
    console.log('❌ Unexpected error in createNewPDP:', error)
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
} 