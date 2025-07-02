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
    <div className={`relative bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 flex flex-col gap-1 ${cardClassName}`} style={{ minHeight: 160 }}>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {fields.map((f, i) => (
            <div key={f.label} className={`flex justify-between items-baseline ${f.highlight ? "text-lg font-bold text-zinc-100" : "text-zinc-300"}`}>
              <span className="opacity-80">{f.label}</span>
              <span>{f.value}</span>
            </div>
          ))}
        </div>
        {actions && <div className="flex gap-2 justify-end mt-4">{actions}</div>}
      </div>
    </div>
  );
} 