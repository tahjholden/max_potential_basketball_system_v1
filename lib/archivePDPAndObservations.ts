import { createClient } from "@/lib/supabase/client"

// Archive a PDP and all related (unarchived) observations. Calls onSuccess after success.
export async function archivePDPAndObservations({
  currentPdp,
  playerId,
  userId,
  onSuccess,      // callback: () => void (e.g., router.push(`/players/${playerId}`))
} : {
  currentPdp: { id: string };
  playerId: string;
  userId: string;
  onSuccess: () => void;
}) {
  const supabase = createClient()
  const now = new Date().toISOString()

  // 1. Archive the PDP
  const { error: pdpError } = await supabase
    .from('pdp')
    .update({
      archived_at: now,
      archived_by: userId,
      updated_at: now
    })
    .eq('id', currentPdp.id)

  if (pdpError) throw new Error(pdpError.message)

  // 2. Archive all related (unarchived) observations for this player
  const { error: obsError } = await supabase
    .from('observations')
    .update({
      archived_at: now,
      archived_by: userId,
      pdp_id: currentPdp.id,  // For traceability
      updated_at: now
    })
    .eq('player_id', playerId)
    .is('archived_at', null)  // Only archive observations that aren't already archived

  if (obsError) throw new Error(obsError.message)

  // 3. Go back to player's page (or fire supplied callback)
  onSuccess()
}

// Comprehensive archive function that handles both PDPs and observations according to schema
export async function archiveDevelopmentPlanAndObservations({
  pdpId,
  playerId,
  userId,
  orgId,
  onSuccess,
  onError
}: {
  pdpId: string;
  playerId: string;
  userId: string;
  orgId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const supabase = createClient()
  const now = new Date().toISOString()

  try {
    // 1. Archive the PDP
    const { error: pdpError } = await supabase
      .from('pdp')
      .update({
        archived_at: now,
        archived_by: userId,
        updated_at: now
      })
      .eq('id', pdpId)
      .eq('org_id', orgId)

    if (pdpError) {
      throw new Error(`Failed to archive PDP: ${pdpError.message}`)
    }

    // 2. Archive all observations linked to this PDP
    const { error: obsError } = await supabase
      .from('observations')
      .update({
        archived_at: now,
        archived_by: userId,
        updated_at: now
      })
      .eq('pdp_id', pdpId)
      .eq('org_id', orgId)
      .is('archived_at', null)

    if (obsError) {
      throw new Error(`Failed to archive observations: ${obsError.message}`)
    }

    // 3. Log the archive activity
    const { error: logError } = await supabase
      .from('activity_log')
      .insert({
        activity_type: 'archive_pdp',
        summary: `Archived development plan and ${obsError ? 'some' : 'all'} related observations`,
        performed_by: userId,
        pdp_id: pdpId,
        org_id: orgId,
        created_at: now
      })

    if (logError) {
      console.warn('Failed to log archive activity:', logError)
      // Don't throw error for logging failures
    }

    onSuccess?.()
    return { success: true }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    onError?.(errorMessage)
    return { success: false, error: errorMessage }
  }
}

// Function to get archived PDPs with their observations
export async function getArchivedPDPsWithObservations(playerId: string, orgId: string) {
  const supabase = createClient()

  // Get archived PDPs
  const { data: archivedPDPs, error: pdpError } = await supabase
    .from('pdp')
    .select(`
      id,
      content,
      start_date,
      end_date,
      created_at,
      archived_at
    `)
    .eq('player_id', playerId)
    .eq('org_id', orgId)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false })

  if (pdpError) {
    throw new Error(`Failed to fetch archived PDPs: ${pdpError.message}`)
  }

  // Get archived observations for each PDP
  const pdpsWithObservations = await Promise.all(
    archivedPDPs.map(async (pdp) => {
      const { data: observations, error: obsError } = await supabase
        .from('observations')
        .select(`
          id,
          content,
          observation_date,
          created_at,
          archived_at
        `)
        .eq('pdp_id', pdp.id)
        .eq('org_id', orgId)
        .not('archived_at', 'is', null)
        .order('observation_date', { ascending: false })

      if (obsError) {
        console.warn(`Failed to fetch observations for PDP ${pdp.id}:`, obsError)
        return { ...pdp, observations: [] }
      }

      return { ...pdp, observations: observations || [] }
    })
  )

  return pdpsWithObservations
} 