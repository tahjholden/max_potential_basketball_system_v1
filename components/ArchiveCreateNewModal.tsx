"use client";
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Modal } from "@/components/ui/UniversalModal"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { archivePDPAndObservations, archiveDevelopmentPlanAndObservations } from "@/lib/archivePDPAndObservations"
import EntityButton from "./EntityButton"
import { format } from "date-fns"

export default function ArchiveCreateNewModal({
  playerId,
  open,
  onClose,
  onSuccess,
}: {
  playerId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentPdp, setCurrentPdp] = useState<any>(null)
  const [newPlanContent, setNewPlanContent] = useState("")

  const resetState = () => {
    setLoading(false)
    setCurrentPdp(null)
    setNewPlanContent("")
  }

  const handleOpenChange = async (isOpen: boolean) => {
    if (isOpen) {
      // Fetch current PDP when modal opens (for PDPs, keep archived_at logic)
      const supabase = createClient()
      const { data } = await supabase
        .from('pdp')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .maybeSingle()
      setCurrentPdp(data)
    } else {
      resetState()
      onClose();
    }
  }

  const handleArchive = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated. Cannot archive development plan.");
        setLoading(false);
        return;
      }

      // Get current PDP
      const { data: currentPdp } = await supabase
        .from('pdp')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .maybeSingle();

      if (!currentPdp) {
        toast.info("No active plan to archive.");
        setLoading(false);
        handleOpenChange(false);
        onSuccess?.();
        return;
      }

      // Get user's org_id (assuming it's stored in user metadata or coaches table)
      const { data: coachData } = await supabase
        .from('coaches')
        .select('org_id')
        .eq('auth_uid', user.id)
        .single();

      const orgId = coachData?.org_id;
      if (!orgId) {
        toast.error("Organization not found. Cannot archive development plan.");
        setLoading(false);
        return;
      }

      // Use the comprehensive archive function
      const result = await archiveDevelopmentPlanAndObservations({
        pdpId: currentPdp.id,
        playerId,
        userId: user.id,
        orgId,
        onSuccess: () => {
          toast.success("Development plan and observations archived successfully.");
          handleOpenChange(false);
          onSuccess?.();
          router.refresh();
        },
        onError: (error) => {
          toast.error(`Failed to archive: ${error}`);
        }
      });

      if (!result.success) {
        toast.error(result.error || "Failed to archive development plan.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during archiving."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal.Archive
      open={open}
      onOpenChange={handleOpenChange}
      title="Archive Current Development Plan"
      description="This will archive the current development plan and all of its associated observations. This action cannot be undone."
      onConfirm={handleArchive}
      confirmText={loading ? "Archiving..." : "Archive Plan & Observations"}
      loading={loading}
      size="lg"
    >
      <div className="py-4 text-sm text-zinc-300 space-y-4">
        {currentPdp?.start_date && (
          <span className="block mt-2 text-xs text-zinc-400">
            Current Plan <span className="italic">(Started {format(new Date(currentPdp.start_date), 'MMMM do, yyyy')})</span>
          </span>
        )}
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3">
          <h4 className="text-[#C2B56B] font-semibold text-sm mb-2">What will be archived:</h4>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>• Current development plan</li>
            <li>• All observations linked to this plan</li>
            <li>• Activity log entry for this archive action</li>
          </ul>
        </div>
        <p className="text-xs text-zinc-500">
          After archiving, you can create a new development plan for this player.
        </p>
      </div>
    </Modal.Archive>
  )
} 