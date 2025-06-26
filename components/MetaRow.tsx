import React from "react";

export interface MetaRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

const MetaRow: React.FC<MetaRowProps> = ({
  label,
  value,
  highlight = false,
  className = "",
}) => (
  <div className={className}>
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
);

export default MetaRow; 