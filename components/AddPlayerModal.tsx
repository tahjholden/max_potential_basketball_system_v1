import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddPlayerModal({ open, onClose, onPlayerAdded }: { open: boolean; onClose: () => void; onPlayerAdded?: () => void }) {
  const [playerForm, setPlayerForm] = useState({ firstName: "", lastName: "", position: "" });
  const [loading, setLoading] = useState(false);

  const handleAddPlayer = async () => {
    if (!playerForm.firstName.trim() || !playerForm.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("players")
        .insert({
          first_name: playerForm.firstName.trim(),
          last_name: playerForm.lastName.trim(),
          position: playerForm.position.trim() || null,
        });
      if (error) throw error;
      toast.success("Player added successfully!");
      setPlayerForm({ firstName: "", lastName: "", position: "" });
      onClose();
      onPlayerAdded?.();
    } catch (error) {
      toast.error("Failed to add player");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#181818] border border-[#d8cc97]/30 rounded-2xl shadow-2xl px-8 py-7 w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-center mb-4 bg-gradient-to-r from-[#d8cc97] via-[#d8cc97] to-[#d8cc97] bg-clip-text text-transparent">
            Add Player
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="player_first_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              First Name *
            </label>
            <Input
              id="player_first_name"
              placeholder="e.g., John"
              value={playerForm.firstName}
              onChange={e => setPlayerForm(prev => ({ ...prev, firstName: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="player_last_name" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Last Name *
            </label>
            <Input
              id="player_last_name"
              placeholder="e.g., Smith"
              value={playerForm.lastName}
              onChange={e => setPlayerForm(prev => ({ ...prev, lastName: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="player_position" className="block text-xs text-[#d8cc97] uppercase tracking-wider mb-1 font-semibold">
              Position
            </label>
            <Input
              id="player_position"
              placeholder="e.g., Forward"
              value={playerForm.position}
              onChange={e => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-[#d8cc97] placeholder-[#d8cc97]/60 focus:border-[#d8cc97] focus:ring-1 focus:ring-[#d8cc97] transition-all duration-200"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#d8cc97]/30 text-[#d8cc97] hover:bg-[#d8cc97]/10"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddPlayer}
            disabled={loading || !playerForm.firstName.trim() || !playerForm.lastName.trim()}
            className="flex-1 bg-[#d8cc97] text-black hover:bg-[#d8cc97]/80 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Player"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 