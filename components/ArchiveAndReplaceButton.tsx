"use client";
import { useState } from "react";
import { Archive, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { archiveAndCreateNewPDP } from "@/lib/archiveAndCreateNewPDP";
import { createClient } from "@/lib/supabase/client";

interface ArchiveAndReplaceButtonProps {
  playerId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "button" | "menu-item";
}

export default function ArchiveAndReplaceButton({ 
  playerId, 
  onSuccess,
  className = "",
  variant = "button"
}: ArchiveAndReplaceButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleArchiveAndNew = async () => {
    setLoading(true);
    try {
      // Get the current PDP first
      const supabase = createClient();
      const { data: currentPdp, error: fetchError } = await supabase
        .from('pdp')
        .select('*')
        .eq('player_id', playerId)
        .is('archived_at', null)
        .single()

      if (fetchError || !currentPdp) {
        toast.error("No active PDP found to archive.");
        setLoading(false);
        return;
      }

      // Use the new consolidated function with default content
      const result = await archiveAndCreateNewPDP({
        currentPdp,
        playerId,
        newContent: "New development plan created automatically."
      })
      
      if (result.success) {
        toast.success("Archived old PDP and created a new one.");
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update PDP.");
      }
    } catch (error) {
      console.error("Archive and create error:", error);
      toast.error("Failed to update PDP.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "menu-item") {
    return (
      <button
        onClick={handleArchiveAndNew}
        disabled={loading}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-[#323232] rounded transition-colors disabled:opacity-50 ${className}`}
      >
        <Archive size={14} />
        <Plus size={14} />
        {loading ? "Processing..." : "Archive & Create New"}
      </button>
    );
  }

  return (
    <button
      onClick={handleArchiveAndNew}
      disabled={loading}
      className={`flex items-center gap-2 bg-[#4a4a4a] text-white px-4 py-2 rounded font-semibold hover:bg-[#5a5a5a] transition-colors disabled:opacity-50 ${className}`}
    >
      <Archive size={16} />
      <Plus size={16} />
      {loading ? "Processing..." : "Archive & Create New"}
    </button>
  );
} 