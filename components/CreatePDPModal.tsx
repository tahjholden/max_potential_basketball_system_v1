import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { GoldButton } from "./ui/gold-button";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useCoach } from "@/hooks/useCoach";
import type { Organization } from "@/types/entities";
import EmptyState from "@/components/ui/EmptyState";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const { coach, isSuperadmin } = useCoach();

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
      setError(null);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!content.trim() || !player) return;
    if (isSuperadmin && !selectedOrgId) {
      setError("Please select an organization");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("User not authenticated.");
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
          setError(`Failed to create coach record: ${createCoachError.message}`);
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
        setError("Organization not found");
        setLoading(false);
        return;
      }
      // Create the new PDP
      const { error: insertError } = await supabase.from("pdp").insert({
        player_id: player.id,
        content: content.trim(),
        start_date: now,
        created_at: now,
        updated_at: now,
        org_id: pdpOrgId,
      });
      if (insertError) {
        if (insertError.code === '23505') {
          setError(
            "This player already has an active PDP. Please refresh and try again."
          );
        } else {
          setError(`Failed to create the new PDP: ${insertError.message}`);
          console.error("PDP creation error:", insertError);
        }
      } else {
        onCreated();
        onClose();
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("PDP creation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!player) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
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
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle>Create New PDP for {player.name}</DialogTitle>
        </DialogHeader>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="New development goals..."
          className="w-full px-3 py-2 rounded bg-[#2a2a2a] border border-slate-600 text-white focus:outline-none focus:ring focus:border-gold"
        />
        {isSuperadmin && (
          <div className="mt-3">
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
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <GoldButton
            onClick={handleCreate}
            disabled={!content.trim() || loading || (isSuperadmin && !selectedOrgId)}
          >
            {loading ? "Creating..." : "Create PDP"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 