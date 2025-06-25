import React from "react";
import PaneTitle from "@/components/PaneTitle";

export interface EntityField {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

interface EntityMetadataCardProps {
  title: string;
  fields: EntityField[];
  actions?: React.ReactNode;
  headerClassName?: string;
  innerClassName?: string;
  cardClassName?: string;
}

const EntityMetadataCard: React.FC<EntityMetadataCardProps> = ({
  title,
  fields,
  actions,
  headerClassName = "",
  innerClassName = "",
  cardClassName = "",
}) => (
  <div className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 ${cardClassName}`}>
    <div className={`flex justify-between items-start mb-2 ${headerClassName}`}>
      <PaneTitle>{title}</PaneTitle>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
    <div className={`bg-zinc-800 rounded px-4 py-3 text-sm space-y-2 ${innerClassName}`}>
      {fields.map(({ label, value, highlight }, idx) => (
        <div key={idx}>
          <span className="text-zinc-500">{label}:</span>{" "}
          <span
            className={
              highlight
                ? "font-bold text-[#C2B56B] text-base"
                : "font-medium text-zinc-300"
            }
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default EntityMetadataCard; 