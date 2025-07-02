"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Archive, ChevronRight, ChevronDown } from "lucide-react";
import { Modal } from "@/components/ui/UniversalModal";
import UniversalButton from "@/components/ui/UniversalButton";
import ArchiveAndReplaceButton from "./ArchiveAndReplaceButton";
import { useCoach } from "@/hooks/useCoach";
import { getUserRole } from "@/lib/role-utils";

interface PDPSectionProps {
  player: any | null;
  currentPdp: any | null;
  archives: any[];
  onPdpChange: (pdp: any) => void;
  onRefresh: () => void;
}

export default function PDPSection({ 
  player, 
  currentPdp, 
  archives, 
  onPdpChange, 
  onRefresh 
}: PDPSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [newPdpContent, setNewPdpContent] = useState("");
  const [editPdpContent, setEditPdpContent] = useState("");
  const [expandedArchives, setExpandedArchives] = useState(false);

  const { coach } = useCoach();
  const userRole = getUserRole(coach);
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";

  const handleCreatePDP = async () => {
    if (!newPdpContent.trim() || !player) {
      toast.error("Please enter PDP content");
      return;
    }
    if (!coach?.org_id) {
      toast.error("Organization information not available");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("pdps")
      .insert({
        player_id: player.id,
        content: newPdpContent.trim(),
        start_date: new Date().toISOString(),
        org_id: coach.org_id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create PDP");
    } else {
      toast.success("PDP created successfully");
      setNewPdpContent("");
      setIsCreateModalOpen(false);
      onPdpChange(data);
      onRefresh();
    }
  };

  const handleEditPDP = async () => {
    if (!currentPdp || !editPdpContent.trim()) {
      toast.error("Please enter PDP content");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("pdps")
      .update({ content: editPdpContent.trim() })
      .eq("id", currentPdp.id);

    if (error) {
      toast.error("Failed to update PDP");
    } else {
      toast.success("PDP updated successfully");
      setEditPdpContent("");
      setIsEditModalOpen(false);
      onRefresh();
    }
  };

  const handleArchivePDP = async () => {
    if (!currentPdp) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("pdps")
      .update({ 
        archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("id", currentPdp.id);

    if (error) {
      toast.error("Failed to archive PDP");
    } else {
      toast.success("PDP archived successfully");
      setIsArchiveModalOpen(false);
      onPdpChange(null);
      onRefresh();
    }
  };

  const handleRestorePDP = async (pdpId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("pdps")
      .update({ 
        archived: false,
        archived_at: null
      })
      .eq("id", pdpId);

    if (error) {
      toast.error("Failed to restore PDP");
    } else {
      toast.success("PDP restored successfully");
      onRefresh();
    }
  };

  if (!player) {
    return (
      <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex items-center justify-center">
        <p className="text-slate-500 italic">Select a player to view PDP</p>
      </div>
    );
  }

  return (
    <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#C2B56B]">{player.name}</h2>
        {!currentPdp && (
          <UniversalButton.Primary
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={14} className="mr-1" />
            Create PDP
          </UniversalButton.Primary>
        )}
      </div>

      {/* Current PDP */}
      <div className="flex-1">
        {currentPdp ? (
          <div className="bg-[#18191A] p-4 rounded-lg border border-[#323232] mb-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-md font-semibold text-white">Current PDP</h3>
              <div className="flex gap-2">
                <UniversalButton.Ghost
                  size="sm"
                  onClick={() => {
                    setEditPdpContent(currentPdp.content || '');
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-[#C2B56B] hover:bg-[#323232]"
                >
                  <Edit size={16} />
                </UniversalButton.Ghost>
                <ArchiveAndReplaceButton
                  playerId={player.id}
                  onSuccess={onRefresh}
                  className="p-1 text-[#C2B56B] hover:bg-[#323232] rounded"
                  variant="button"
                />
                <UniversalButton.Ghost
                  size="sm"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="p-1 text-red-400 hover:bg-[#323232]"
                >
                  <Archive size={16} />
                </UniversalButton.Ghost>
              </div>
            </div>
            <p className="text-slate-300 text-sm whitespace-pre-wrap mb-3">
              {currentPdp.content || 'No content available'}
            </p>
            <p className="text-xs text-slate-500">
              Started: {new Date(currentPdp.start_date).toLocaleDateString()}
            </p>
          </div>
        ) : (
          <div className="bg-[#18191A] p-4 rounded-lg border border-[#323232] mb-4">
            <p className="text-yellow-400 italic text-sm">No active PDP</p>
          </div>
        )}

        {/* Archived PDPs */}
        {archives.length > 0 && (
          <div className="bg-[#18191A] p-4 rounded-lg border border-[#323232]">
            <UniversalButton.Ghost
              onClick={() => setExpandedArchives(!expandedArchives)}
              className="flex items-center gap-2 text-white font-semibold mb-3 p-0"
            >
              {expandedArchives ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Archived PDPs ({archives.length})
            </UniversalButton.Ghost>
            
            {expandedArchives && (
              <div className="space-y-3">
                {archives.map((pdp) => (
                  <div key={pdp.id} className="border-l-2 border-slate-600 pl-3">
                    <p className="text-slate-300 text-sm whitespace-pre-wrap mb-2">
                      {pdp.content}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-500">
                        {new Date(pdp.start_date).toLocaleDateString()} - {new Date(pdp.archived_at).toLocaleDateString()}
                      </p>
                      <UniversalButton.Text
                        size="xs"
                        onClick={() => handleRestorePDP(pdp.id)}
                        className="text-xs text-[#C2B56B] hover:underline"
                      >
                        Restore
                      </UniversalButton.Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create PDP Modal */}
      <Modal.Add
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        title="Create New PDP"
        description="Enter the development plan content below."
        onSubmit={handleCreatePDP}
        submitText="Create PDP"
        loading={false}
        disabled={!newPdpContent.trim()}
      >
        <textarea
          placeholder="Enter development plan content..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none h-32 resize-none"
          value={newPdpContent}
          onChange={(e) => setNewPdpContent(e.target.value)}
          autoFocus
        />
      </Modal.Add>

      {/* Edit PDP Modal */}
      <Modal.Edit
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit PDP"
        description="Update the development plan content below."
        onSubmit={handleEditPDP}
        submitText="Update PDP"
        loading={false}
        disabled={!editPdpContent.trim()}
      >
        <textarea
          placeholder="Enter development plan content..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none h-32 resize-none"
          value={editPdpContent}
          onChange={(e) => setEditPdpContent(e.target.value)}
          autoFocus
        />
      </Modal.Edit>

      {/* Archive PDP Modal */}
      <Modal.Archive
        open={isArchiveModalOpen}
        onOpenChange={setIsArchiveModalOpen}
        title="Archive PDP"
        description="Are you sure you want to archive this PDP? It will be moved to the archived section."
        onConfirm={handleArchivePDP}
        confirmText="Archive PDP"
        loading={false}
      />
    </div>
  );
} 