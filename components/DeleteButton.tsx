"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteButton({
  onConfirm,
  entity = "Item",
  description,
  iconOnly = true,
  label = "Delete",
}: {
  onConfirm: () => void;
  entity?: string;
  description?: string;
  iconOnly?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {iconOnly ? (
          <button className="text-red-500 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        ) : (
          <button className="text-red-500 hover:text-red-600 text-sm">{label}</button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 text-white border border-zinc-700">
        <DialogHeader>
          <DialogTitle>Delete {entity}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-zinc-400 my-4">
          {description || "This action is permanent and cannot be undone."}
        </p>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 