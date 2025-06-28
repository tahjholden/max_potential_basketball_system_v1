"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import toast from "react-hot-toast";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playerData: {
    first_name: string;
    last_name: string;
    pdpContent?: string;
  }) => Promise<void>;
}

export default function AddPlayerModal({
  open,
  onClose,
  onSubmit,
}: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    pdpContent: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error("First and last name are required.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ first_name: "", last_name: "", pdpContent: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white rounded-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gold-500" style={{ color: '#facc15' }}>
            Add New Player
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-300"
            >
              First Name *
            </label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, first_name: e.target.value }))
              }
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              placeholder="e.g., Michael"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-300"
            >
              Last Name *
            </label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, last_name: e.target.value }))
              }
              className="bg-zinc-800 border-zinc-600 text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500"
              placeholder="e.g., Jordan"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="pdp_content"
              className="block text-sm font-medium text-gray-300"
            >
              Initial PDP (Optional)
            </label>
            <textarea
              id="pdp_content"
              value={formData.pdpContent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pdpContent: e.target.value }))
              }
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-offset-0 focus:ring-gold-500 focus:border-gold-500 min-h-[100px] resize-y"
              placeholder="Enter initial development plan for this player..."
            />
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
              type="submit"
              disabled={loading || !formData.first_name.trim() || !formData.last_name.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? "Adding Player..." : "Add Player"}
            </GoldButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 