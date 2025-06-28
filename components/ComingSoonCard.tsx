import React from "react";

interface ComingSoonCardProps {
  title?: string;
  features: { label: string; description?: string }[];
  note?: string;
  className?: string;
}

export default function ComingSoonCard({
  title,
  features,
  note,
  className = "",
}: ComingSoonCardProps) {
  return (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-bold text-[#C2B56B] mb-3">{title}</h3>
      )}
      <ul className="list-disc ml-5 space-y-2 text-zinc-300 text-sm">
        {features.map((f, i) => (
          <li key={i}>
            <span className="font-semibold text-[#C2B56B]">{f.label}</span>
            {f.description && <span className="ml-1 text-zinc-400">{f.description}</span>}
          </li>
        ))}
      </ul>
      {note && (
        <div className="mt-4 text-xs text-zinc-500 italic">{note}</div>
      )}
    </div>
  );
} 