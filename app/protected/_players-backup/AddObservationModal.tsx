"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Player = {
  id: string;
  name: string;
  position?: string;
  created_at: string;
  last_pdp_date?: string;
  has_active_pdp?: boolean;
};

interface AddObservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (observationData: { player_id: string; content: string; observation_date: string }) => void;
  players: Player[];
}

export default function AddObservationModal({ open, onClose, onSubmit, players }: AddObservationModalProps) {
  const [formData, setFormData] = useState({
    player_id: "",
    content: "",
    observation_date: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.player_id || !formData.content.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ player_id: "", content: "", observation_date: new Date().toISOString().slice(0, 10) });
    } catch (error) {
      console.error("Error adding observation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ player_id: "", content: "", observation_date: new Date().toISOString().slice(0, 10) });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-gold text-xl font-bold">
            Add New Observation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Player *
            </label>
            <select
              value={formData.player_id}
              onChange={(e) => setFormData(prev => ({ ...prev, player_id: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none"
              required
            >
              <option value="">Select a player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} {player.position ? `(${player.position})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observation Date *
            </label>
            <Input
              type="date"
              value={formData.observation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, observation_date: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white focus:border-gold"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observation Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:border-gold focus:outline-none min-h-[120px] resize-vertical"
              placeholder="Enter your observation details..."
              required
            />
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
              disabled={loading || !formData.player_id || !formData.content.trim()}
              className="bg-gold text-black hover:bg-gold/80 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Observation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 