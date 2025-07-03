import { createClient } from '@/lib/supabase/client'

// Define types based on your database schema
type Pdp = {
  id: string;
  player_id: string;
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
  archived?: boolean;
  archived_by?: string;
  updated_at?: string;
  created_by?: string;
  org_id?: string;
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
    // Step 0: Get current user and ensure coach record exists
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated." };
    }

    // Step 0.5: Look up (or create) the coach record
    let coachId: string;
    let { data: coachRow } = await supabase
      .from('coaches')
      .select('id')
      .eq('auth_uid', user.id)
      .maybeSingle();

    if (!coachRow) {
      // Auto-create coach record if missing
      const { data: newCoach, error: createCoachError } = await supabase
        .from('coaches')
        .insert({
          auth_uid: user.id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          email: user.email || '',
          is_admin: false,
          active: true,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (createCoachError) {
        console.error('Error creating coach record:', createCoachError);
        return { success: false, error: `Failed to create coach record: ${createCoachError.message}` };
      }
      coachId = newCoach.id;
    } else {
      coachId = coachRow.id;
    }

    // Step 1: Archive the current PDP if it exists
    if (currentPdp) {
      const { error: pdpError } = await supabase.from('pdp').update({
        archived_at: now,
        archived_by: user.id,
        updated_at: now
      }).eq('id', currentPdp.id);

      if (pdpError) {
        console.error('Error archiving PDP:', pdpError);
        return { success: false, error: `Failed to archive PDP: ${pdpError.message}` };
      }

      // Step 2: Archive all unarchived observations for this player and associate them with the archived PDP
      const { error: obsError } = await supabase
        .from('observations')
        .update({
          archived: true,
          archived_by: user.id,
          pdp_id: currentPdp.id,
          updated_at: now
        })
        .eq('player_id', playerId)
        .eq('archived', false);

      if (obsError) {
        console.error('Error archiving linked observations:', obsError);
        return { success: false, error: `Failed to archive observations: ${obsError.message}` };
      }
      
      console.log(`Archived observations for PDP ${currentPdp.id}`);
    }

    // Step 3: Create the new PDP (removed coach_id since it no longer exists on pdp table)
    const { data: newPdp, error: createPdpError } = await supabase
      .from('pdp')
      .insert({
        player_id: playerId,
        content: newContent,
        start_date: now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (createPdpError) {
      console.error('Error creating new PDP:', createPdpError);
      return { success: false, error: `Failed to create new PDP: ${createPdpError.message}` };
    }

    return { success: true, data: newPdp };

  } catch (error) {
    console.error('Unexpected error in archiveAndCreateNewPDP:', error);
    return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
} 