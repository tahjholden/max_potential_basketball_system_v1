import React, { useState, useEffect } from "react";
import { GoldModal } from "@/components/ui/gold-modal";
import { createClient } from "@/lib/supabase/client";
import { archiveAndCreateNewPDP } from "@/lib/pdpUtils";
import toast from "react-hot-toast";
import EmptyState from "@/components/ui/EmptyState";

interface ManagePDPModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  onSuccess: () => void;
}

export default function ManagePDPModal({ 
  open, 
  onClose, 
  player,
  onSuccess,
}: ManagePDPModalProps) {
  const [content, setContent] = useState("");
  const [currentPDP, setCurrentPDP] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open && player) {
      fetchCurrentPDP();
      setContent("");
    }
  }, [open, player]);

  const fetchCurrentPDP = async () => {
    try {
      const { data } = await supabase
        .from("pdp")
        .select("*")
        .eq("player_id", player.id)
        .is("archived_at", null)
        .single();
      
      setCurrentPDP(data);
      if (data) {
        setContent(data.content || "");
      }
    } catch (err) {
      console.error("Error fetching current PDP:", err);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      if (currentPDP) {
        // Update existing PDP
        const { error } = await supabase
          .from("pdp")
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq("id", currentPDP.id);
        
        if (error) throw error;
      } else {
        // Create new PDP
        const { error } = await supabase
          .from("pdp")
          .insert([{ 
            player_id: player.id, 
            content: content.trim(),
            start_date: new Date().toISOString().split('T')[0]
          }]);
        
        if (error) throw error;
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving PDP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveAndCreate = async () => {
    if (!content.trim() || !currentPDP) return;
    
    setLoading(true);
    try {
      // Use the utility function to archive and create new PDP
      const newPDP = await archiveAndCreateNewPDP(player.id);
      
      if (newPDP) {
        // Update the new PDP with the content from the form
        const { error } = await supabase
          .from("pdp")
          .update({ 
            content: content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq("id", newPDP.id);
        
        if (error) throw error;
        
        toast.success("Archived old PDP and created a new one.");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to archive and create new PDP.");
      }
    } catch (err) {
      console.error("Error archiving and creating PDP:", err);
      toast.error("Failed to update PDP.");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !player) {
    return (
      <GoldModal open={open} onOpenChange={onClose} title="Player Not Found">
        <EmptyState 
          variant="error" 
          title="Player Not Found" 
          description="The player to manage PDP for could not be found."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </GoldModal>
    );
  }

  const playerName = player.first_name && player.last_name 
    ? `${player.first_name} ${player.last_name}` 
    : player.name;

  return (
    <GoldModal open={open} onOpenChange={onClose} title={`Manage PDP for ${playerName}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#f5f5f7] mb-1">
            {currentPDP ? "Update PDP Content" : "Create New PDP"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter PDP content..."
            className="w-full p-3 bg-[#323232] text-[#f5f5f7] border border-[#323232] rounded focus:border-[#d8cc97] focus:outline-none min-h-[120px]"
            rows={6}
          />
        </div>
        
        {currentPDP && (
          <div className="text-sm text-[#b0b0b0]">
            <p>Current PDP started: {new Date(currentPDP.start_date).toLocaleDateString()}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={!content.trim() || loading}
            className="flex-1 px-4 py-2 rounded bg-[#d8cc97] text-[#161616] font-semibold hover:bg-[#d8cc97]/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : currentPDP ? "Update PDP" : "Create PDP"}
          </button>
          
          {currentPDP && (
            <button 
              onClick={handleArchiveAndCreate}
              disabled={!content.trim() || loading}
              className="flex-1 px-4 py-2 rounded bg-[#4a4a4a] text-white font-semibold hover:bg-[#5a5a5a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Archive & Create New"}
            </button>
          )}
        </div>
      </div>
    </GoldModal>
  );
} 