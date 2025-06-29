import React from "react";

interface Field {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}
interface Props {
  fields: Field[];
  actions?: React.ReactNode;
  cardClassName?: string;
}
export default function EntityMetadataCard({ fields, actions, cardClassName = "" }: Props) {
  return (
    <div className={`bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex flex-col gap-1 ${cardClassName}`}>
      {fields.map((f, i) => (
        <div key={f.label} className={`flex justify-between items-baseline ${f.highlight ? "text-lg font-bold text-zinc-100" : "text-zinc-300"}`}>
          <span className="opacity-80">{f.label}</span>
          <span>{f.value}</span>
        </div>
      ))}
      {actions && <div className="mt-2">{actions}</div>}
    </div>
  );
} 