"use client";
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Modal } from "@/components/ui/UniversalModal"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { archiveAndCreateNewPDP } from "@/lib/archiveAndCreateNewPDP"
import EntityButton from "./EntityButton"

export default function ArchiveCreateNewModal({
  playerId,
  onSuccess,
}: {
  playerId: string;
  onSuccess?: () => void;
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [modalState, setModalState] = useState<"confirm" | "create">("confirm")

  const resetState = () => {
    setContent("")
    setLoading(false)
    setModalState("confirm")
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState()
    }
    setOpen(isOpen)
  }

  const handleArchive = async () => {
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { data: currentPdp } = await supabase
        .from('pdps')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .maybeSingle()
      
      if (currentPdp) {
        toast.success("Previous plan archived successfully.")
      } else {
        toast.info("No active plan to archive. Proceeding to create a new one.")
      }
      
      setModalState("create")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during archiving."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!content.trim()) {
      toast.error("Please provide content for the new development plan.")
      return
    }
    setLoading(true)

    try {
      // Get the current PDP to archive
      const supabase = createClient();
      const { data: currentPdp } = await supabase
        .from('pdps')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .maybeSingle();

      // Use the improved archiveAndCreateNewPDP function
      const result = await archiveAndCreateNewPDP({
        currentPdp,
        playerId,
        newContent: content.trim()
      });

      if (result.success) {
        toast.success("New development plan created!");
        handleOpenChange(false);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create new development plan.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during creation."
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <EntityButton 
        color="gold"
        onClick={() => setOpen(true)}
      >
        Archive & Create New
      </EntityButton>
      
      {modalState === "confirm" ? (
        <Modal.Archive
          open={open}
          onOpenChange={handleOpenChange}
          title="Archive Current Plan"
          description="This will close the current development plan and archive all of its associated observations."
          onConfirm={handleArchive}
          confirmText={loading ? "Archiving..." : "Confirm & Continue"}
          loading={loading}
        >
          <div className="py-4 text-sm">
            <p>Are you sure you want to proceed? This action cannot be undone.</p>
          </div>
        </Modal.Archive>
      ) : (
        <Modal.Add
          open={open}
          onOpenChange={handleOpenChange}
          title="Create New Development Plan"
          description="The previous plan has been archived. Now, create a new plan for the player."
          onSubmit={handleCreate}
          submitText={loading ? "Creating..." : "Create New Plan"}
          loading={loading}
          disabled={!content.trim()}
        >
          <div className="py-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded bg-zinc-800 border border-zinc-600 p-3 text-white text-sm resize-none"
              placeholder="Write the new development plan here..."
              autoFocus
            />
          </div>
        </Modal.Add>
      )}
    </>
  )
} 