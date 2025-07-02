import { Modal } from "@/components/ui/UniversalModal"

interface Props {
  player: { id: string; name: string }
  onClose: () => void
}

export default function PDPModal({ player, onClose }: Props) {
  return (
    <Modal.Edit
      open={true}
      onOpenChange={(open) => !open && onClose()}
      title={`Edit PDP for ${player.name}`}
      description="Update the development plan content below."
      onSubmit={() => {
        // Placeholder - not yet hooked to Supabase
        console.log("Save PDP (placeholder)");
      }}
      submitText="Save (placeholder)"
      disabled={true}
    >
      <div className="mt-4 space-y-2">
        <textarea
          className="w-full p-2 bg-zinc-800 text-white rounded-lg"
          placeholder="PDP content (not yet hooked to Supabase)"
          rows={5}
        />
      </div>
    </Modal.Edit>
  )
} 