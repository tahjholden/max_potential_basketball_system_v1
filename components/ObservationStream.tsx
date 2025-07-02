"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Calendar, User, Edit, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/UniversalModal";
import UniversalButton from "@/components/ui/UniversalButton";
import { useCoach } from "@/hooks/useCoach";
import { getUserRole } from "@/lib/role-utils";

interface ObservationStreamProps {
  pdp: any | null;
  observations: any[];
  onRefresh: () => void;
}

export default function ObservationStream({ pdp, observations, onRefresh }: ObservationStreamProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newObservationContent, setNewObservationContent] = useState("");
  const [editObservationContent, setEditObservationContent] = useState("");
  const [selectedObservation, setSelectedObservation] = useState<any>(null);

  const { coach } = useCoach();
  const userRole = getUserRole(coach);
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";

  const handleAddObservation = async () => {
    if (!newObservationContent.trim()) {
      toast.error("Please enter observation content");
      return;
    }
    if (!coach?.org_id) {
      toast.error("Organization information not available");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("observations")
      .insert({
        pdp_id: pdp.id,
        content: newObservationContent.trim(),
        observation_date: new Date().toISOString(),
        org_id: coach.org_id,
      });

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
    if (!selectedObservation || !editObservationContent.trim()) {
      toast.error("Please enter observation content");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("observations")
      .update({
        content: editObservationContent.trim(),
      })
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
    
    const supabase = createClient();
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
        <UniversalButton.Primary
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={14} className="mr-1" />
          Add
        </UniversalButton.Primary>
      </div>

      <div className="flex-1 space-y-3 -mr-2 pr-2">
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
                  <UniversalButton.Ghost
                    size="sm"
                    onClick={() => {
                      setSelectedObservation(obs);
                      setEditObservationContent(obs.content);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-[#C2B56B] hover:bg-[#323232]"
                  >
                    <Edit size={14} />
                  </UniversalButton.Ghost>
                  <UniversalButton.Ghost
                    size="sm"
                    onClick={() => {
                      setSelectedObservation(obs);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1 text-red-400 hover:bg-[#323232]"
                  >
                    <Trash2 size={14} />
                  </UniversalButton.Ghost>
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
      <Modal.Add
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Add New Observation"
        description="Enter the details of your observation below."
        onSubmit={handleAddObservation}
        submitText="Add Observation"
        loading={false}
        disabled={!newObservationContent.trim()}
      >
        <textarea
          placeholder="Enter observation details..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none h-32 resize-none"
          value={newObservationContent}
          onChange={(e) => setNewObservationContent(e.target.value)}
          autoFocus
        />
      </Modal.Add>

      {/* Edit Observation Modal */}
      <Modal.Edit
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        title="Edit Observation"
        description="Update the observation details below."
        onSubmit={handleEditObservation}
        submitText="Update Observation"
        loading={false}
        disabled={!editObservationContent.trim()}
      >
        <textarea
          placeholder="Enter observation details..."
          className="w-full bg-[#18191A] border border-[#323232] rounded-md px-3 py-2 text-[#f5f5f7] placeholder:text-[#b0b0b0] focus:border-[#C2B56B] focus:outline-none h-32 resize-none"
          value={editObservationContent}
          onChange={(e) => setEditObservationContent(e.target.value)}
          autoFocus
        />
      </Modal.Edit>

      {/* Delete Observation Modal */}
      <Modal.Delete
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Observation"
        description="Are you sure you want to delete this observation? This action cannot be undone."
        onConfirm={handleDeleteObservation}
        confirmText="Delete Observation"
        loading={false}
      />
    </div>
  );
} 