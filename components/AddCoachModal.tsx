import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OutlineButton } from "@/components/ui/gold-outline-button";
import { createClient } from "@/lib/supabase/client";
import { useCoach } from "@/hooks/useCoach";
import { getUserRole, isAdminOrHigher, isSuperadmin } from "@/lib/role-utils";
import toast from "react-hot-toast";

interface Organization {
  id: string;
  name: string;
}

export default function AddCoachModal({ open, onClose, onCoachAdded }: { open: boolean; onClose: () => void; onCoachAdded?: () => void }) {
  const { coach } = useCoach();
  const [coachForm, setCoachForm] = useState({ 
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

  const currentUserRole = getUserRole(coach);
  const canAssignAdmin = isAdminOrHigher(coach);
  const canAssignSuperadmin = isSuperadmin(coach);

  // Fetch organizations if user is superadmin
  useEffect(() => {
    if (open && canAssignSuperadmin) {
      fetchOrganizations();
    }
  }, [open, canAssignSuperadmin]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orgs')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleAddCoach = async () => {
    if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim()) {
      toast.error("First name, last name, and email are required");
      return;
    }

    // Validate role assignments
    if (coachForm.isSuperadmin && !canAssignSuperadmin) {
      toast.error("You don't have permission to assign superadmin role");
      return;
    }

    if (coachForm.isAdmin && !canAssignAdmin) {
      toast.error("You don't have permission to assign admin role");
      return;
    }

    // Set organization based on user role
    let orgId = coachForm.orgId;
    if (!canAssignSuperadmin) {
      // Non-superadmin users can only assign to their own organization
      orgId = coach?.org_id || "";
    } else if (!orgId) {
      toast.error("Please select an organization");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      
      // Create the coach record
      const { data, error } = await supabase
        .from('coaches')
        .insert({
          first_name: coachForm.firstName.trim(),
          last_name: coachForm.lastName.trim(),
          email: coachForm.email.trim().toLowerCase(),
          phone: coachForm.phone.trim() || null,
          is_admin: coachForm.isAdmin,
          is_superadmin: coachForm.isSuperadmin,
          org_id: orgId,
          active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Coach added successfully!");
      setCoachForm({ 
        firstName: "", 
        lastName: "", 
        email: "", 
        phone: "",
        isAdmin: false,
        isSuperadmin: false,
        orgId: ""
      });
      onClose();
      onCoachAdded?.();
    } catch (error: any) {
      console.error('Error adding coach:', error);
      toast.error(error.message || "Failed to add coach");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#d8cc97]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#d8cc97] via-[#d8cc97] to-[#d8cc97] bg-clip-text text-transparent">
            Add Coach
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="coach_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              First Name *
            </label>
            <Input
              id="coach_first_name"
              placeholder="e.g., John"
              value={coachForm.firstName}
              onChange={e => setCoachForm(prev => ({ ...prev, firstName: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="coach_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Last Name *
            </label>
            <Input
              id="coach_last_name"
              placeholder="e.g., Smith"
              value={coachForm.lastName}
              onChange={e => setCoachForm(prev => ({ ...prev, lastName: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="coach_email" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Email *
            </label>
            <Input
              id="coach_email"
              type="email"
              placeholder="e.g., john.smith@example.com"
              value={coachForm.email}
              onChange={e => setCoachForm(prev => ({ ...prev, email: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="coach_phone" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Phone Number
            </label>
            <Input
              id="coach_phone"
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={coachForm.phone}
              onChange={e => setCoachForm(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            />
          </div>

          {/* Organization Selection (Superadmin only) */}
          {canAssignSuperadmin && (
            <div>
              <label htmlFor="coach_org" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
                Organization *
              </label>
              <select
                id="coach_org"
                value={coachForm.orgId}
                onChange={e => setCoachForm(prev => ({ ...prev, orgId: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200 p-3"
                disabled={loadingOrgs}
                required
              >
                <option value="">Select Organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Role
            </label>
            
            {/* Superadmin Role */}
            {canAssignSuperadmin && (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coachForm.isSuperadmin}
                  onChange={e => {
                    setCoachForm(prev => ({ 
                      ...prev, 
                      isSuperadmin: e.target.checked,
                      isAdmin: e.target.checked ? false : prev.isAdmin // Uncheck admin if superadmin is checked
                    }));
                  }}
                  className="w-4 h-4 text-purple-600 bg-zinc-900 border-zinc-700 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-sm text-purple-300 font-medium">Superadmin</span>
                <span className="text-xs text-zinc-500">(Full system access)</span>
              </label>
            )}

            {/* Admin Role */}
            {canAssignAdmin && (
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coachForm.isAdmin}
                  onChange={e => {
                    setCoachForm(prev => ({ 
                      ...prev, 
                      isAdmin: e.target.checked,
                      isSuperadmin: e.target.checked ? false : prev.isSuperadmin // Uncheck superadmin if admin is checked
                    }));
                  }}
                  disabled={coachForm.isSuperadmin}
                  className="w-4 h-4 text-gold bg-zinc-900 border-zinc-700 rounded focus:ring-gold focus:ring-2 disabled:opacity-50"
                />
                <span className="text-sm text-gold font-medium">Administrator</span>
                <span className="text-xs text-zinc-500">(Organization-wide access)</span>
              </label>
            )}

            {/* Coach Role (default) */}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!coachForm.isAdmin && !coachForm.isSuperadmin}
                onChange={e => {
                  if (e.target.checked) {
                    setCoachForm(prev => ({ 
                      ...prev, 
                      isAdmin: false,
                      isSuperadmin: false
                    }));
                  }
                }}
                disabled={coachForm.isAdmin || coachForm.isSuperadmin}
                className="w-4 h-4 text-[#C2B56B] bg-zinc-900 border-zinc-700 rounded focus:ring-[#C2B56B] focus:ring-2 disabled:opacity-50"
              />
              <span className="text-sm text-[#C2B56B] font-medium">Coach</span>
              <span className="text-xs text-zinc-500">(Team-based access)</span>
            </label>
          </div>
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
            onClick={handleAddCoach}
            disabled={loading || !coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim() || (canAssignSuperadmin && !coachForm.orgId)}
            className="flex-1 px-6 py-2"
          >
            {loading ? "Adding..." : "Add Coach"}
          </OutlineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 