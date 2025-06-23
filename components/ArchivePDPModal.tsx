import { createClient } from "@/lib/supabase/client";
import { GoldModal } from "@/components/ui/gold-modal";

export default function ArchivePDPModal({
  open,
  onClose,
  player,
  pdp,
  onArchived,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  pdp: { id: string; content: string; start_date: string } | null;
  onArchived: () => void;
}) {
  // Don't render if player or pdp is null
  if (!player || !pdp) {
    return null;
  }

  const handleArchive = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", pdp.id);

    if (!error) {
      onClose();     // close archive modal
      onArchived();  // open create PDP modal
    } else {
      console.error("Failed to archive PDP:", error);
    }
  };

  return (
    <GoldModal
      open={open}
      onOpenChange={onClose}
      title={`Manage PDP for ${player.name}`}
      footer={
        <button
          onClick={handleArchive}
          className="border border-[#d8cc97] text-xs px-3 py-1.5 rounded font-semibold text-[#d8cc97] hover:bg-[#d8cc97]/10 transition"
        >
          Archive & Create New
        </button>
      }
    >
      <p className="text-sm text-slate-400 mb-2">
        Current PDP <span className="italic">(Started {new Date(pdp.start_date).toLocaleDateString()})</span>
      </p>
      <div className="bg-[#1e1e1e] border border-slate-600 p-3 rounded text-sm text-slate-300">
        {pdp.content}
      </div>
    </GoldModal>
  );
} 