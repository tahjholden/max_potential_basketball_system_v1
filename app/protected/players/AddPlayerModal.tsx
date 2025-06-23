"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function AddPlayerModal({ onPlayerAdded }: { onPlayerAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [initialPDP, setInitialPDP] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Insert the player (do NOT insert 'name', it's a generated column)
      const { data: player, error: playerError } = await supabase
        .from("players")
        .insert({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          position: position.trim() || null,
        })
        .select()
        .single();

      if (playerError) {
        console.error("Error adding player:", playerError);
        toast.error(`Failed to add player: ${playerError.message}`);
        return;
      }

      // Optionally create initial PDP if provided
      if (initialPDP.trim() && player) {
        const { error: pdpError } = await supabase.from("pdp").insert({
          player_id: player.id,
          content: initialPDP.trim(),
          archived_at: null,
          start_date: new Date().toISOString(),
        });

        if (pdpError) {
          console.error("Error adding PDP:", pdpError);
          toast.error(`Player added but failed to create PDP: ${pdpError.message}`);
          // Still call onPlayerAdded since the player was created successfully
          onPlayerAdded?.();
          handleClose();
          return;
        }
      }
      
      toast.success("Player added successfully!");
      onPlayerAdded?.();
      handleClose();
    } catch (error) {
      console.error("Unexpected error adding player:", error);
      toast.error("An unexpected error occurred while adding the player.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFirstName("");
    setLastName("");
    setPosition("");
    setInitialPDP("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GoldButton>Add Player</GoldButton>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gold-500" style={{ color: '#facc15' }}>
            Add New Player
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">
              First Name *
            </label>
            <Input
              id="first_name"
              placeholder="e.g., Michael"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">
              Last Name *
            </label>
            <Input
              id="last_name"
              placeholder="e.g., Jordan"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="position" className="block text-sm font-medium text-gray-300">
              Position (Optional)
            </label>
            <Input
              id="position"
              placeholder="e.g., Point Guard"
              value={position}
              onChange={e => setPosition(e.target.value)}
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="initial_pdp" className="block text-sm font-medium text-gray-300">
              Initial PDP (Optional)
            </label>
            <textarea
              id="initial_pdp"
              placeholder="Enter initial development plan for this player..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500 min-h-[100px] resize-y"
              value={initialPDP}
              onChange={e => setInitialPDP(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="pt-4 sm:justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <GoldButton
            onClick={handleAdd}
            disabled={loading || !firstName.trim() || !lastName.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? "Adding Player..." : "Add Player"}
          </GoldButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 