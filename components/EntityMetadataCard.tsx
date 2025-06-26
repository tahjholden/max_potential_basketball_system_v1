import React from "react";
import PaneTitle from "@/components/PaneTitle";

export interface EntityField {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

interface EntityMetadataCardProps {
  title?: string;
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
  <div className={`bg-zinc-900 border border-zinc-700 rounded-lg px-4 pt-3 pb-4 relative ${cardClassName}`}>
    {/* Action buttons positioned absolutely in top-right corner */}
    {actions && (
      <div className="absolute top-3 right-4 z-10">
        {actions}
      </div>
    )}
    
    {/* Title only - no layout impact */}
    {title && (
      <div className={`mb-1 ${headerClassName}`}>
        <PaneTitle>{title}</PaneTitle>
      </div>
    )}
    
    {/* Metadata content anchored to top */}
    <div className={`text-sm flex flex-col items-start gap-1 ${innerClassName}`}>
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