"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { archiveDevelopmentPlanAndObservations } from "@/lib/archivePDPAndObservations";
import { toast } from "sonner";
import { Archive, Loader2 } from "lucide-react";

interface ArchivePDPButtonProps {
  pdpId: string;
  playerId: string;
  playerName: string;
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function ArchivePDPButton({
  pdpId,
  playerId,
  playerName,
  onSuccess,
  className = "",
  variant = "outline",
  size = "sm"
}: ArchivePDPButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated. Cannot archive development plan.");
        return;
      }

      // Get user's org_id
      const { data: coachData } = await supabase
        .from('coaches')
        .select('org_id')
        .eq('auth_uid', user.id)
        .single();

      const orgId = coachData?.org_id;
      if (!orgId) {
        toast.error("Organization not found. Cannot archive development plan.");
        return;
      }

      const result = await archiveDevelopmentPlanAndObservations({
        pdpId,
        playerId,
        userId: user.id,
        orgId,
        onSuccess: () => {
          toast.success(`Development plan for ${playerName} archived successfully.`);
          onSuccess?.();
        },
        onError: (error) => {
          toast.error(`Failed to archive: ${error}`);
        }
      });

      if (!result.success) {
        toast.error(result.error || "Failed to archive development plan.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900";
    
    const variantClasses = {
      default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline: "border border-red-600 text-zinc-400 hover:bg-red-600 hover:text-white focus:ring-red-500",
      ghost: "text-zinc-400 hover:bg-red-600 hover:text-white focus:ring-red-500"
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded",
      md: "px-4 py-2 text-sm rounded-md",
      lg: "px-6 py-3 text-base rounded-lg"
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  return (
    <button
      onClick={handleArchive}
      disabled={loading}
      className={getButtonClasses()}
      title="Archive development plan and all related observations"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Archive className="w-4 h-4" />
      )}
      {loading ? "Archiving..." : "Archive Plan"}
    </button>
  );
} 