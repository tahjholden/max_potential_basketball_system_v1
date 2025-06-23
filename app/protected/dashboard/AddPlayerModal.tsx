"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playerData: { first_name: string; last_name: string; pdpContent?: string }) => void;
}

export default function AddPlayerModal({ open, onClose, onSubmit }: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    pdpContent: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ first_name: "", last_name: "", pdpContent: "" });
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ first_name: "", last_name: "", pdpContent: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-[#facc15] text-xl font-bold">
            Add New Player
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="bg-zinc-800 border-zinc-700 text-white focus:border-[#facc15]"
              placeholder="Enter first name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="bg-zinc-800 border-zinc-700 text-white focus:border-[#facc15]"
              placeholder="Enter last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDP (optional)
            </label>
            <textarea
              value={formData.pdpContent}
              onChange={(e) => setFormData(prev => ({ ...prev, pdpContent: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:border-[#facc15] focus:outline-none min-h-[80px]"
              placeholder="Enter initial PDP for this player (optional)"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <GoldButton
              type="submit"
              disabled={loading || !formData.first_name.trim() || !formData.last_name.trim()}
            >
              {loading ? "Adding..." : "Add Player"}
            </GoldButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 