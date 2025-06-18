import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  player: { id: string; name: string }
  onClose: () => void
}

export default function PDPModal({ player, onClose }: Props) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white">
        <DialogHeader>
          <DialogTitle>Edit PDP for {player.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <textarea
            className="w-full p-2 bg-zinc-800 text-white rounded-lg"
            placeholder="PDP content (not yet hooked to Supabase)"
            rows={5}
          />
          <Button className="w-full">Save (placeholder)</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 