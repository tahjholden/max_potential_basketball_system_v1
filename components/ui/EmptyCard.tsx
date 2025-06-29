import React from "react";

export default function EmptyCard({ title, description, titleClassName = "" }: { title: string, description?: string, titleClassName?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-8 flex flex-col items-center justify-center min-h-[120px]">
      <div className={`text-zinc-400 text-center font-semibold mb-2 ${titleClassName}`}>{title}</div>
      {description && <div className="text-zinc-500 text-center">{description}</div>}
    </div>
  );
} 