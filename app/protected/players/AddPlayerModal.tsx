"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playerData: { first_name: string; last_name: string; position?: string; pdpContent?: string }, addPDPNow: boolean) => void;
}

export default function AddPlayerModal({ open, onClose, onSubmit }: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    position: "",
    pdpContent: ""
  });
  const [addPDPNow, setAddPDPNow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, addPDPNow);
      setFormData({ first_name: "", last_name: "", position: "", pdpContent: "" });
      setAddPDPNow(false);
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ first_name: "", last_name: "", position: "", pdpContent: "" });
    setAddPDPNow(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl font-bold">
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
              className="bg-slate-700 border-slate-600 text-white focus:border-gold"
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
              className="bg-slate-700 border-slate-600 text-white focus:border-gold"
              placeholder="Enter last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
            >
              <option value="">Select position</option>
              <option value="Forward">Forward</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Defender">Defender</option>
              <option value="Goalkeeper">Goalkeeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDP (optional)
            </label>
            <textarea
              value={formData.pdpContent}
              onChange={(e) => setFormData(prev => ({ ...prev, pdpContent: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none min-h-[80px]"
              placeholder="Enter initial PDP for this player (optional)"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="add-pdp-now"
              checked={addPDPNow}
              onChange={() => setAddPDPNow(v => !v)}
              className="accent-gold"
            />
            <label htmlFor="add-pdp-now" className="text-sm text-gray-300">Add PDP now</label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.first_name.trim() || !formData.last_name.trim()}
              className="bg-gold text-black hover:bg-gold/80 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Player"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 