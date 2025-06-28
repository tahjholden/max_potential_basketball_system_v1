"use client";
import { useState } from "react";
import { Edit, Archive, Plus, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import ArchiveAndReplaceButton from "./ArchiveAndReplaceButton";

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
  const [expandedArchives, setExpandedArchives] = useState(false);
  const [newPdpContent, setNewPdpContent] = useState("");
  const [editPdpContent, setEditPdpContent] = useState("");
  const supabase = createClient();

  const handleCreatePDP = async () => {
    if (!player || !newPdpContent.trim()) return;
    
    const { error } = await supabase
      .from("pdp")
      .insert([{
        player_id: player.id,
        content: newPdpContent.trim(),
        start_date: new Date().toISOString()
      }]);
    
    if (error) {
      toast.error("Failed to create PDP");
    } else {
      toast.success("PDP created successfully");
      setNewPdpContent("");
      setIsCreateModalOpen(false);
      onRefresh();
    }
  };

  const handleEditPDP = async () => {
    if (!currentPdp || !editPdpContent.trim()) return;
    
    const { error } = await supabase
      .from("pdp")
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
    
    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", currentPdp.id);
    
    if (error) {
      toast.error("Failed to archive PDP");
    } else {
      toast.success("PDP archived successfully");
      setIsArchiveModalOpen(false);
      onRefresh();
    }
  };

  const handleRestorePDP = async (pdpId: string) => {
    const { error } = await supabase
      .from("pdp")
      .update({ archived_at: null })
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
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 bg-[#C2B56B] text-[#161616] px-3 py-1 rounded text-sm font-semibold hover:bg-[#C2B56B]/80 transition-colors"
          >
            <Plus size={14} /> Create PDP
          </button>
        )}
      </div>

      {/* Current PDP */}
      <div className="flex-1">
        {currentPdp ? (
          <div className="bg-[#18191A] p-4 rounded-lg border border-[#323232] mb-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-md font-semibold text-white">Current PDP</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditPdpContent(currentPdp.content || '');
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-[#C2B56B] hover:bg-[#323232] rounded"
                >
                  <Edit size={16} />
                </button>
                <ArchiveAndReplaceButton
                  playerId={player.id}
                  onSuccess={onRefresh}
                  className="p-1 text-[#C2B56B] hover:bg-[#323232] rounded"
                  variant="button"
                />
                <button
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="p-1 text-red-400 hover:bg-[#323232] rounded"
                >
                  <Archive size={16} />
                </button>
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
            <button
              onClick={() => setExpandedArchives(!expandedArchives)}
              className="flex items-center gap-2 text-white font-semibold mb-3"
            >
              {expandedArchives ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Archived PDPs ({archives.length})
            </button>
            
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
                      <button
                        onClick={() => handleRestorePDP(pdp.id)}
                        className="text-xs text-[#C2B56B] hover:underline"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create PDP Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Create New PDP</h3>
            <textarea
              placeholder="Enter PDP content..."
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none mb-4 h-32 resize-none"
              value={newPdpContent}
              onChange={(e) => setNewPdpContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreatePDP}
                className="flex-1 bg-[#C2B56B] text-[#161616] px-4 py-2 rounded font-semibold hover:bg-[#C2B56B]/80 transition-colors"
              >
                Create PDP
              </button>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewPdpContent("");
                }}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit PDP Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Edit PDP</h3>
            <textarea
              placeholder="Enter PDP content..."
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none mb-4 h-32 resize-none"
              value={editPdpContent}
              onChange={(e) => setEditPdpContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleEditPDP}
                className="flex-1 bg-[#C2B56B] text-[#161616] px-4 py-2 rounded font-semibold hover:bg-[#C2B56B]/80 transition-colors"
              >
                Update PDP
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditPdpContent("");
                }}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive PDP Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Archive PDP</h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to archive this PDP? This will move it to the archived section.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleArchivePDP}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
              >
                Archive PDP
              </button>
              <button
                onClick={() => setIsArchiveModalOpen(false)}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 