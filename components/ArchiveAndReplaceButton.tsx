"use client";
import { useState } from "react";
import { Archive, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { archiveAndCreateNewPDP } from "@/lib/pdpUtils";

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
      const newPDP = await archiveAndCreateNewPDP(playerId);
      
      if (newPDP) {
        toast.success("Archived old PDP and created a new one.");
        onSuccess?.();
      } else {
        toast.error("Failed to update PDP. No active PDP found.");
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