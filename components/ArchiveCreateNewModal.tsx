"use client";
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
  const [error, setError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<"confirm" | "create">("confirm")

  const resetState = () => {
    setContent("")
    setLoading(false)
    setError(null)
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
    setError(null)
    const supabase = createClient()
    
    try {
      const { data: currentPdp } = await supabase
        .from('pdp')
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
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!content.trim()) {
      setError("Please provide content for the new development plan.")
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Get the current PDP to archive
      const supabase = createClient();
      const { data: currentPdp } = await supabase
        .from('pdp')
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
        setError(result.error || "Failed to create new development plan.");
        toast.error(result.error || "Failed to create new development plan.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred during creation."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <EntityButton color="gold">Archive & Create New</EntityButton>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-md">
        {modalState === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold mb-3">Archive Current Plan</DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                This will close the current development plan and archive all of its associated observations.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-sm">
              <p>Are you sure you want to proceed? This action cannot be undone.</p>
            </div>
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 p-3 rounded text-sm text-red-400">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => handleOpenChange(false)} 
                disabled={loading}
                className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchive} 
                disabled={loading} 
                className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition disabled:opacity-50"
              >
                {loading ? "Archiving..." : "Confirm & Continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold mb-3">Create New Development Plan</DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                The previous plan has been archived. Now, create a new plan for the player.
              </DialogDescription>
            </DialogHeader>
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
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 p-3 rounded text-sm text-red-400">{error}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => handleOpenChange(false)} 
                disabled={loading}
                className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                disabled={loading || content.trim() === ""} 
                className="border border-[#d8cc97] text-sm px-4 py-2 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create New Plan"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 