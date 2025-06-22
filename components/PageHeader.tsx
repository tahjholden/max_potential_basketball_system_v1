import React from "react";
import { format } from "date-fns";

export default function PageHeader({ playerName }: { playerName: string }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-semibold text-yellow-300">
        Player Profile: <span className="text-white">{playerName}</span>
      </h1>
      <p className="text-sm text-zinc-500">
        Last updated: {format(new Date(), "MMM d, yyyy")}
      </p>
    </div>
  );
} 