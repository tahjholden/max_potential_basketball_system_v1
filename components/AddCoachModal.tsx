import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OutlineButton } from "@/components/ui/gold-outline-button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddCoachModal({ open, onClose, onCoachAdded }: { open: boolean; onClose: () => void; onCoachAdded?: () => void }) {
  const [coachForm, setCoachForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleAddCoach = async () => {
    if (!coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim()) {
      toast.error("First name, last name, and email are required");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      // For now, just show a success message since coach creation might require admin privileges
      toast.success("Coach creation functionality coming soon!");
      setCoachForm({ firstName: "", lastName: "", email: "", phone: "" });
      onClose();
      onCoachAdded?.();
    } catch (error) {
      toast.error("Failed to add coach");
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
            disabled={loading || !coachForm.firstName.trim() || !coachForm.lastName.trim() || !coachForm.email.trim()}
            className="flex-1 px-6 py-2"
          >
            {loading ? "Adding..." : "Add Coach"}
          </OutlineButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 