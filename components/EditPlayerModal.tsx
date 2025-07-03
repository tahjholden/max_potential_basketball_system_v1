import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/UniversalModal";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/ui/EmptyState";

export default function EditPlayerModal({
  open,
  onClose,
  player,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string; first_name?: string; last_name?: string; position?: string; team_id?: string } | null;
  onSuccess: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    if (open && player) {
      setFirstName(player.first_name || "");
      setLastName(player.last_name || "");
      setPosition(player.position || "");
      setSelectedTeamId(player.team_id || "");
      
      // Fetch teams for the dropdown
      const fetchTeams = async () => {
        const supabase = createClient();
        const { data: teamsData } = await supabase
          .from("teams")
          .select("id, name")
          .order("name");
        setTeams(teamsData || []);
      };
      fetchTeams();
    }
  }, [open, player]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !player) {
      toast.error("First name and last name are required");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("players")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          position: position.trim() || null,
          team_id: selectedTeamId || null,
        })
        .eq("id", player.id);

      if (error) {
        toast.error("Failed to update player");
        return;
      }

      toast.success("Player updated successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!player) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="Player Not Found"
        description="The player to edit could not be found."
      >
        <EmptyState 
          variant="error" 
          title="Player Not Found" 
          description="The player to edit could not be found."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </Modal.Info>
    );
  }

  const isFormValid = firstName.trim() && lastName.trim();

  return (
    <Modal.Edit
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={`Edit Player`}
      description="Update the player's information below."
      onSubmit={handleSave}
      submitText={loading ? "Saving..." : "Save Changes"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            First Name *
          </label>
          <Input
            id="edit_first_name"
            placeholder="e.g., John"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="edit_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Last Name *
          </label>
          <Input
            id="edit_last_name"
            placeholder="e.g., Smith"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="edit_team" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Team
          </label>
          <select
            id="edit_team"
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit_position" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Position
          </label>
          <Input
            id="edit_position"
            placeholder="e.g., Forward"
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
          />
        </div>
      </div>
    </Modal.Edit>
  );
} 