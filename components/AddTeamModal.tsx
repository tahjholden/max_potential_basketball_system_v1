import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OutlineButton } from "@/components/ui/gold-outline-button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useCoach } from "@/hooks/useCoach";
import type { Organization } from "@/types/entities";

export default function AddTeamModal({ open, onClose, onTeamAdded }: { open: boolean; onClose: () => void; onTeamAdded?: () => void }) {
  const [teamName, setTeamName] = useState("");
  const [coachId, setCoachId] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const { coach, isSuperadmin } = useCoach();

  // Fetch orgs for superadmin
  useEffect(() => {
    if (open && isSuperadmin) {
      setLoadingOrgs(true);
      createClient()
        .from("orgs")
        .select("id, name")
        .order("name")
        .then(({ data, error }) => {
          setLoadingOrgs(false);
          if (error) {
            toast.error("Failed to fetch organizations");
            setOrganizations([]);
            return;
          }
          setOrganizations(data || []);
          if (data && data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        });
    }
    if (!open) {
      setSelectedOrgId("");
    }
  }, [open, isSuperadmin]);

  const handleAddTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }
    if (isSuperadmin && !selectedOrgId) {
      toast.error("Please select an organization");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const orgId = isSuperadmin ? selectedOrgId : coach?.org_id;
      if (!orgId) {
        toast.error("Organization not found");
        setLoading(false);
        return;
      }
      // For now, just show a success message since team creation might require more logic
      const { data, error } = await supabase.from("teams").insert({
        name: teamName.trim(),
        coach_id: coach?.id,
        org_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) {
        toast.error("Failed to add team");
        setLoading(false);
        return;
      }
      toast.success("Team added successfully!");
      setTeamName("");
      setCoachId("");
      onClose();
      onTeamAdded?.();
    } catch (error) {
      toast.error("Failed to add team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#C2B56B]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#C2B56B] via-[#C2B56B] to-[#C2B56B] bg-clip-text text-transparent">
            Add Team
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="team_name" className="block text-xs text-[#C2B56B] tracking-wider mb-1 font-semibold">
              Team Name*
            </label>
            <Input
              id="team_name"
              placeholder="e.g., U12 Gold"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B] placeholder-[#C2B56B]/60 focus:border-[#C2B56B] focus:ring-1 focus:ring-[#C2B56B] transition-all duration-200"
              required
            />
          </div>
          {isSuperadmin && (
            <div>
              <label htmlFor="org_select" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
                Organization
              </label>
              <select
                id="org_select"
                value={selectedOrgId}
                onChange={e => setSelectedOrgId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B]"
                disabled={loadingOrgs}
              >
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-3 pt-4">
          <OutlineButton
            type="button"
            color="zinc"
            onClick={onClose}
            className="flex-1 px-6 py-2"
            disabled={loading}
          >
            Cancel
          </OutlineButton>
          <OutlineButton
            color="gold"
            onClick={handleAddTeam}
            disabled={loading || !teamName.trim() || (isSuperadmin && !selectedOrgId)}
            className="flex-1 px-6 py-2"
          >
            {loading ? "Adding..." : "Add Team"}
          </OutlineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 