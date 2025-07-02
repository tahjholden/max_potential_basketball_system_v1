import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/UniversalModal";
import EmptyState from "@/components/ui/EmptyState";

export default function EditPDPModal({
  open,
  onClose,
  player,
  currentPdp,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  currentPdp: { id: string; content: string | null; start_date: string } | null;
  onSuccess: () => void;
}) {
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && currentPdp?.content) {
      setNewContent(currentPdp.content);
    } else if (open) {
      setNewContent("");
    }
  }, [open, currentPdp]);

  const handleSave = async () => {
    if (!newContent.trim() || !currentPdp) {
      toast.error("Please enter PDP content");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pdps")
        .update({
          content: newContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentPdp.id)
        .select()
        .maybeSingle();

      if (error || !data) {
        toast.error("Update failed. The plan may have been archived or deleted.");
        return;
      }

      toast.success("PDP updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!player || !currentPdp) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="Missing Information"
        description="Player or PDP information is missing."
      >
        <EmptyState 
          variant="error" 
          title="Missing Information" 
          description="Player or PDP information is missing."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </Modal.Info>
    );
  }

  return (
    <Modal.Edit
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={`Edit PDP for ${player.name}`}
      description="Update the development plan content below."
      onSubmit={handleSave}
      submitText={loading ? "Saving..." : "Save Changes"}
      loading={loading}
      disabled={!newContent.trim()}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-zinc-400 mb-1 font-semibold">Current Plan</p>
          <p className="text-sm text-zinc-500 bg-zinc-800 rounded p-3 min-h-[40px]">
            {currentPdp.content || "No content."}
          </p>
        </div>

        <div>
          <label htmlFor="newPDP" className="text-sm text-zinc-300 block mb-1">Edit Plan</label>
          <textarea
            id="newPDP"
            rows={5}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 rounded text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-gold"
            placeholder="Enter the updated development plan content..."
          />
        </div>
      </div>
    </Modal.Edit>
  );
} 