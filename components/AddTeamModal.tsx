import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCoach } from "@/hooks/useCoach";
import { Modal } from "@/components/ui/UniversalModal";
import UniversalButton from "@/components/ui/UniversalButton";
import type { Organization } from "@/types/entities";

type CoachLite = { id: string; first_name: string; last_name: string };

export default function AddTeamModal({ open, onClose, onTeamAdded }: { open: boolean; onClose: () => void; onTeamAdded?: () => void }) {
  const [teamName, setTeamName] = useState("");
  const [coachId, setCoachId] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [coaches, setCoaches] = useState<CoachLite[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);

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
          setOrganizations((data || []) as Organization[]);
          if (data && data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        });
    }
    if (!open) {
      setSelectedOrgId("");
    }
  }, [open, isSuperadmin]);

  // Fetch coaches for the selected org (or current org if not superadmin)
  useEffect(() => {
    async function fetchCoaches(orgId: string) {
      setLoadingCoaches(true);
      const { data, error } = await createClient()
        .from("coaches")
        .select("id, first_name, last_name")
        .eq("org_id", orgId)
        .order("last_name");
      setLoadingCoaches(false);
      if (error) {
        toast.error("Failed to fetch coaches");
        setCoaches([]);
        return;
      }
      setCoaches(data || []);
    }
    if (open) {
      const orgId = isSuperadmin ? selectedOrgId : coach?.org_id;
      if (orgId) fetchCoaches(orgId);
    } else {
      setCoaches([]);
    }
  }, [open, selectedOrgId, isSuperadmin, coach?.org_id]);

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
      const coachToUse = coachId || coach?.id;
      if (!coachToUse) {
        toast.error("Coach information missing. Please contact support.");
        setLoading(false);
        return;
      }
      console.log("Creating team with:", { name: teamName.trim(), coach_id: coachToUse, org_id: orgId });
      const { data, error } = await supabase.from("teams").insert({
        name: teamName.trim(),
        coach_id: coachToUse,
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

  const isFormValid = teamName.trim() && (!isSuperadmin || selectedOrgId);

  return (
    <Modal.Add
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title="Add Team"
      description="Enter the team information below."
      onSubmit={handleAddTeam}
      submitText={loading ? "Adding..." : "Add Team"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
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
        <div>
          <label htmlFor="coach_select" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
            Coach (optional)
          </label>
          <select
            id="coach_select"
            value={coachId}
            onChange={e => setCoachId(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#C2B56B]"
            disabled={loadingCoaches}
          >
            <option value="">(Default: You)</option>
            {coaches.map(c => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal.Add>
  );
} 