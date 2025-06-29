import React from "react";

export interface EntityField {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

interface EntityMetadataCardProps {
  fields: EntityField[];
  actions?: React.ReactNode;
  headerClassName?: string;
  innerClassName?: string;
  cardClassName?: string;
  className?: string;
}

const EntityMetadataCard: React.FC<EntityMetadataCardProps> = ({
  fields,
  actions,
  headerClassName = "",
  innerClassName = "",
  cardClassName = "",
  className = "",
}) => (
  <div className={`bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-neutral-200 ${cardClassName} ${className}`}>
    {/* Action buttons positioned absolutely in top-right corner */}
    {actions && (
      <div className="absolute top-3 right-4 z-10">
        {actions}
      </div>
    )}
    {/* Metadata content anchored to top */}
    <div className={`text-sm flex flex-col items-start gap-1 ${innerClassName}`}>
      {fields.map(({ label, value, highlight }, idx) => (
        <div key={idx} className="mb-1 last:mb-0">
          {label !== "" && (
            <span className="text-zinc-500">{label}:</span>
          )}
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