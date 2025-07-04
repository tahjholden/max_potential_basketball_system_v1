"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useCoach } from "@/hooks/useCoach";
import { toast } from "sonner";
import { Modal } from "@/components/ui/UniversalModal";
import type { Organization } from "@/types/entities";

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  player: any;
  onObservationAdded?: () => void;
}

export default function AddObservationModal({
  open,
  onClose,
  player,
  onObservationAdded,
}: AddObservationModalProps) {
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
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
        .select("id, name, created_at")
        .order("name")
        .then(({ data, error }) => {
          setLoadingOrgs(false);
          if (error) {
            setOrganizations([]);
            return;
          }
          setOrganizations((data || []).map((org: any) => ({
            id: org.id,
            name: org.name,
            created_at: org.created_at || ""
          })));
          if (data && data.length > 0) {
            setSelectedOrgId(data[0].id);
          }
        });
    }
    if (!open) {
      setSelectedOrgId("");
    }
  }, [open, isSuperadmin]);

  useEffect(() => {
    if (open) {
      // Set date to today in YYYY-MM-DD format
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!content.trim() || !date) {
      toast.error("Observation and date required");
      return;
    }
    if (isSuperadmin && !selectedOrgId) {
      toast.error("Please select an organization");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // Fetch the player's current active PDP
      const { data: pdp, error: pdpError } = await supabase
        .from("pdp")
        .select("id")
        .eq("player_id", player.id)
        .is("archived_at", null)
        .maybeSingle();
      if (pdpError) {
        toast.error("Error fetching current PDP");
        setLoading(false);
        return;
      }
      if (!pdp) {
        toast.error("No active development plan (PDP) found for this player. Please create a PDP first.");
        setLoading(false);
        return;
      }
      await supabase.from("observations").insert({
        player_id: player.id,
        pdp_id: pdp.id,
        content: content.trim(),
        observation_date: date,
        archived: false,
        org_id: isSuperadmin ? selectedOrgId : coach?.org_id,
        created_by: coach?.id,
      });
      toast.success("Observation added successfully!");
      setContent("");
      setDate("");
      onClose();
      onObservationAdded?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to add observation");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = content.trim() && date && (!isSuperadmin || selectedOrgId);

  return (
    <Modal.Add
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Add Observation"
      description="Enter the observation details below."
      onSubmit={handleSubmit}
      submitText={loading ? "Saving..." : "Add"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-3">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={loading}
        />
        <textarea
          placeholder="Enter observation details..."
          className="w-full rounded bg-zinc-800 p-2 text-white min-h-[80px] resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
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
    </Modal.Add>
  );
} 