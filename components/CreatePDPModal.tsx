import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCoach } from "@/hooks/useCoach";
import { Modal } from "@/components/ui/UniversalModal";
import EmptyState from "@/components/ui/EmptyState";
import type { Organization } from "@/types/entities";

export default function CreatePDPModal({
  open,
  onClose,
  player,
  coachId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  player: { id: string; name: string } | null;
  coachId?: string;
  onCreated: () => void;
}) {
  const [content, setContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const { coach, isSuperadmin } = useCoach();

  // Initialize start date to today when modal opens
  useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
    }
  }, [open]);

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
            setOrganizations([]);
            return;
          }
          setOrganizations((data || []).map((org: any) => ({
            id: org.id,
            name: org.name,
            created_at: org.created_at || new Date().toISOString()
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
    if (!open) {
      setContent("");
      setStartDate("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!content.trim() || !player) {
      toast.error("Please enter PDP content");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (isSuperadmin && !selectedOrgId) {
      toast.error("Please select an organization");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error("User not authenticated.");
        setLoading(false);
        return;
      }
      // Look up (or create) the coach record
      let coachId: string;
      let orgId: string | undefined;
      let { data: coachRow } = await supabase
        .from('coaches')
        .select('id, org_id')
        .eq('auth_uid', user.id)
        .maybeSingle();
      if (!coachRow) {
        // Auto-create coach record if missing
        const { data: newCoach, error: createCoachError } = await supabase
          .from('coaches')
          .insert({
            auth_uid: user.id,
            first_name: user.user_metadata?.first_name || '',
            last_name: user.user_metadata?.last_name || '',
            email: user.email || '',
            is_admin: false,
            active: true,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        if (createCoachError) {
          toast.error(`Failed to create coach record: ${createCoachError.message}`);
          setLoading(false);
          return;
        }
        coachId = newCoach.id;
        orgId = newCoach.org_id;
      } else {
        coachId = coachRow.id;
        orgId = coachRow.org_id;
      }
      // Determine org_id for PDP
      const pdpOrgId = isSuperadmin ? selectedOrgId : orgId;
      if (!pdpOrgId) {
        toast.error("Organization not found");
        setLoading(false);
        return;
      }
      // Create the new PDP with the selected start date
      const { error: insertError } = await supabase.from("pdp").insert({
        player_id: player.id,
        content: content.trim(),
        start_date: startDate,
        created_at: now,
        updated_at: now,
        org_id: pdpOrgId,
      });
      if (insertError) {
        if (insertError.code === '23505') {
          toast.error("This player already has an active PDP. Please refresh and try again.");
        } else {
          toast.error(`Failed to create the new PDP: ${insertError.message}`);
          console.error("PDP creation error:", insertError);
        }
      } else {
        toast.success("PDP created successfully!");
        onCreated();
        onClose();
      }
    } catch (err) {
      toast.error(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("PDP creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = content.trim() && startDate && (!isSuperadmin || selectedOrgId);

  if (!player) {
    return (
      <Modal.Info
        open={open}
        onOpenChange={(open) => !open && onClose()}
        title="Player Not Found"
        description="The selected player could not be found."
      >
        <EmptyState 
          variant="error" 
          title="Player Not Found" 
          description="The selected player could not be found."
          action={{
            label: "Close",
            onClick: onClose,
            color: "gray"
          }}
        />
      </Modal.Info>
    );
  }

  return (
    <Modal.Add
      open={open}
      onOpenChange={(open) => !open && onClose()}
      title={`Create New PDP for ${player.name}`}
      description="Enter the development plan content and start date below."
      onSubmit={handleCreate}
      submitText={loading ? "Creating..." : "Create PDP"}
      loading={loading}
      disabled={!isFormValid}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="start_date" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="pdp_content" className="block text-xs text-[#C2B56B] uppercase tracking-wider mb-1 font-semibold">
            Development Plan Content
          </label>
          <textarea
            id="pdp_content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="New development goals..."
            className="w-full px-3 py-2 rounded bg-[#2a2a2a] border border-slate-600 text-white focus:outline-none focus:ring focus:border-gold"
            disabled={loading}
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
    </Modal.Add>
  );
} 