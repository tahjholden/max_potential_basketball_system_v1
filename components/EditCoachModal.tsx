import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Modal } from "@/components/ui/UniversalModal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
}

export default function EditCoachModal({
  open,
  onClose,
  coach,
  onCoachEdited,
}: {
  open: boolean;
  onClose: () => void;
  coach: any | null;
  onCoachEdited?: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isAdmin: false,
    isSuperadmin: false,
    orgId: ""
  });
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");

  useEffect(() => {
    if (open && coach) {
      setForm({
        firstName: coach.first_name || "",
        lastName: coach.last_name || "",
        email: coach.email || "",
        phone: coach.phone || "",
        isAdmin: coach.is_admin || false,
        isSuperadmin: coach.is_superadmin || false,
        orgId: coach.org_id || ""
      });
      setSelectedTeamId(coach.team_id || "");
      // Fetch teams for the coach's org
      if (coach.org_id) {
        const fetchTeams = async () => {
          const supabase = createClient();
          const { data: teamsData, error: teamsError } = await supabase
            .from("teams")
            .select("id, name")
            .eq("org_id", coach.org_id)
            .order("name");
          if (!teamsError && teamsData) {
            setTeams(teamsData);
          } else {
            setTeams([]);
          }
        };
        fetchTeams();
      } else {
        setTeams([]);
      }
    }
  }, [open, coach]);

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !coach) {
      toast.error("First name, last name, and email are required");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("coaches")
        .update({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          is_admin: form.isAdmin,
          is_superadmin: form.isSuperadmin,
          org_id: form.orgId || null,
          team_id: selectedTeamId || null,
        })
        .eq("id", coach.id);
      if (error) {
        toast.error("Failed to update coach");
        return;
      }
      toast.success("Coach updated successfully!");
      onCoachEdited?.();
      onClose();
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!coach) return null;

  const isFormValid = form.firstName.trim() && form.lastName.trim() && form.email.trim();

  return (
    <Modal.Edit
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={`Edit Coach`}
      description="Update the coach's information below."
      onSubmit={handleSave}
      submitText={loading ? "Saving..." : "Save Changes"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="edit_coach_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            First Name *
          </label>
          <Input
            id="edit_coach_first_name"
            placeholder="e.g., John"
            value={form.firstName}
            onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="edit_coach_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Last Name *
          </label>
          <Input
            id="edit_coach_last_name"
            placeholder="e.g., Smith"
            value={form.lastName}
            onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="edit_coach_email" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Email *
          </label>
          <Input
            id="edit_coach_email"
            type="email"
            placeholder="e.g., john.smith@example.com"
            value={form.email}
            onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            required
          />
        </div>
        <div>
          <label htmlFor="edit_coach_phone" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Phone Number
          </label>
          <Input
            id="edit_coach_phone"
            type="tel"
            placeholder="e.g., (555) 123-4567"
            value={form.phone}
            onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
            className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="edit_coach_team" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
            Team
          </label>
          <select
            id="edit_coach_team"
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200 p-3"
          >
            <option value="">No Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal.Edit>
  );
} 