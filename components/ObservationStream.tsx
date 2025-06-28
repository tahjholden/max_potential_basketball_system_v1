"use client";
import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface ObservationStreamProps {
  pdp: any | null;
  observations: any[];
  onRefresh: () => void;
}

export default function ObservationStream({ pdp, observations, onRefresh }: ObservationStreamProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<any | null>(null);
  const [newObservationContent, setNewObservationContent] = useState("");
  const [editObservationContent, setEditObservationContent] = useState("");
  const supabase = createClient();

  const handleAddObservation = async () => {
    if (!pdp || !newObservationContent.trim()) return;
    
    const { error } = await supabase
      .from("observations")
      .insert([{
        pdp_id: pdp.id,
        player_id: pdp.player_id,
        content: newObservationContent.trim(),
        observation_date: new Date().toISOString()
      }]);
    
    if (error) {
      toast.error("Failed to add observation");
    } else {
      toast.success("Observation added successfully");
      setNewObservationContent("");
      setIsAddModalOpen(false);
      onRefresh();
    }
  };

  const handleEditObservation = async () => {
    if (!selectedObservation || !editObservationContent.trim()) return;
    
    const { error } = await supabase
      .from("observations")
      .update({ content: editObservationContent.trim() })
      .eq("id", selectedObservation.id);
    
    if (error) {
      toast.error("Failed to update observation");
    } else {
      toast.success("Observation updated successfully");
      setEditObservationContent("");
      setIsEditModalOpen(false);
      setSelectedObservation(null);
      onRefresh();
    }
  };

  const handleDeleteObservation = async () => {
    if (!selectedObservation) return;
    
    const { error } = await supabase
      .from("observations")
      .delete()
      .eq("id", selectedObservation.id);
    
    if (error) {
      toast.error("Failed to delete observation");
    } else {
      toast.success("Observation deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedObservation(null);
      onRefresh();
    }
  };

  const getCoachName = (coach: any) => {
    if (!coach) return "Unknown Coach";
    return `${coach.first_name || ""} ${coach.last_name || ""}`.trim() || "Unknown Coach";
  };

  if (!pdp) {
    return (
      <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex items-center justify-center">
        <p className="text-slate-500 italic">Select a player with an active PDP to view observations</p>
      </div>
    );
  }

  return (
    <div className="bg-[#232323] rounded-lg p-4 border border-[#323232] h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#C2B56B]">Observations ({observations.length})</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 bg-[#C2B56B] text-[#161616] px-3 py-1 rounded text-sm font-semibold hover:bg-[#C2B56B]/80 transition-colors"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 -mr-2 pr-2">
        {observations.length > 0 ? (
          observations.map((obs) => (
            <div key={obs.id} className="bg-[#18191A] p-4 rounded-lg border border-[#323232]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(obs.observation_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {getCoachName(obs.coaches)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedObservation(obs);
                      setEditObservationContent(obs.content);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-[#C2B56B] hover:bg-[#323232] rounded"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedObservation(obs);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 text-red-400 hover:bg-[#323232] rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">
                {obs.content}
              </p>
            </div>
          ))
        ) : (
          <div className="bg-[#18191A] p-6 rounded-lg border border-[#323232] text-center">
            <p className="text-slate-500 italic">No observations yet</p>
            <p className="text-slate-400 text-sm mt-2">Add your first observation to start tracking progress</p>
          </div>
        )}
      </div>

      {/* Add Observation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Add New Observation</h3>
            <textarea
              placeholder="Enter observation details..."
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none mb-4 h-32 resize-none"
              value={newObservationContent}
              onChange={(e) => setNewObservationContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddObservation}
                className="flex-1 bg-[#C2B56B] text-[#161616] px-4 py-2 rounded font-semibold hover:bg-[#C2B56B]/80 transition-colors"
              >
                Add Observation
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewObservationContent("");
                }}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Observation Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Edit Observation</h3>
            <textarea
              placeholder="Enter observation details..."
              className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none mb-4 h-32 resize-none"
              value={editObservationContent}
              onChange={(e) => setEditObservationContent(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleEditObservation}
                className="flex-1 bg-[#C2B56B] text-[#161616] px-4 py-2 rounded font-semibold hover:bg-[#C2B56B]/80 transition-colors"
              >
                Update Observation
              </button>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditObservationContent("");
                  setSelectedObservation(null);
                }}
                className="flex-1 bg-[#323232] text-white px-4 py-2 rounded font-semibold hover:bg-[#404040] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Observation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#232323] p-6 rounded-lg border border-[#323232] w-96">
            <h3 className="text-lg font-bold text-[#C2B56B] mb-4">Delete Observation</h3>
            <p className="text-slate-300 mb-4">
              Are you sure you want to delete this observation? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteObservation}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Observation
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedObservation(null);
                }}
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