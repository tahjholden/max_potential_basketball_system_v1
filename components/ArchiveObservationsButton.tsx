"use client";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ArchiveObservationsButtonProps {
  pdpId: string;
  onSuccess?: () => void;
}

export default function ArchiveObservationsButton({ pdpId, onSuccess }: ArchiveObservationsButtonProps) {
  
  const handleArchive = async () => {
    const supabase = createClient();
    const now = new Date().toISOString();

    const { error, count } = await supabase.from("observations").update({
      archived: true,
      archived_at: now
    }, { count: 'exact' })
    .eq('pdp_id', pdpId)
    .eq('archived', false);

    if (error) {
      toast.error(`Failed to archive observations: ${error.message}`);
      console.error("Error archiving observations:", error);
    } else {
      toast.success(`Successfully archived ${count} observation(s).`);
      console.log(`Archived ${count} observations for PDP ${pdpId}.`);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <button
      onClick={handleArchive}
      className="bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded hover:bg-red-700 transition"
    >
      Archive Obs.
    </button>
  );
} 