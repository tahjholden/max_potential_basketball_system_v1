import { useState } from "react"
import { archiveAndCreateNewPDP } from "@/lib/archiveAndCreateNewPDP"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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

  const handleArchiveAndCreate = async () => {
    if (!content.trim()) {
      setError("Please provide content for the new development plan.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, get the current PDP. It's okay if one doesn't exist.
      const supabase = createClient()
      const { data: currentPdp } = await supabase
        .from('pdp')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .maybeSingle() // Use maybeSingle to prevent errors if no PDP is found

      console.log('Attempting to archive and create new PDP for player:', playerId)
      
      const result = await archiveAndCreateNewPDP({
        currentPdp, // This will be the PDP object or null
        playerId,
        newContent: content.trim()
      })
      
      console.log('Archive and create result:', result)
      setLoading(false)
      
      if (result.success) {
        // Reset state and close modal
        setContent("")
        setError(null)
        setOpen(false)
        
        // Call onSuccess callback if provided
        onSuccess?.()
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setError(result.error || "An unknown error occurred.")
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Archive & Create New</Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border border-zinc-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-3">
            Archive & Create New Plan
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-zinc-800 p-3 rounded border border-zinc-600">
            <h3 className="text-sm font-medium text-yellow-300 mb-2">What will happen:</h3>
            <ul className="text-xs text-zinc-300 space-y-1">
              <li>• Any existing active PDP will be archived.</li>
              <li>• All unlinked observations will be tied to it.</li>
              <li>• A new, active PDP will be created with your content below.</li>
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">New Development Plan Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full rounded bg-zinc-800 border border-zinc-600 p-3 text-white text-sm resize-none"
              placeholder="Write the new development plan here..."
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleArchiveAndCreate} 
            disabled={loading || content.trim() === ""}
            className="bg-gold text-black hover:bg-gold/90"
          >
            {loading ? "Processing..." : "Archive and Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 