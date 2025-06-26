import React from "react";
import { format } from "date-fns";

export interface BubbleRowProps {
  id: string;
  content: string;
  date: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: "observation" | "archive" | "default";
}

const BubbleRow: React.FC<BubbleRowProps> = ({
  id,
  content,
  date,
  title,
  subtitle,
  actions,
  className = "",
  variant = "default",
}) => {
  const baseClasses = "bg-zinc-800 p-3 rounded text-sm";
  const variantClasses = {
    observation: "border-l-2 border-[#C2B56B]",
    archive: "border-l-2 border-zinc-600",
    default: "",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-2">
          {title && <p className="text-[#C2B56B] font-semibold">{title}</p>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      
      <p className="text-zinc-300 mb-2">{content}</p>
      
      <div className="flex items-center justify-between">
        {subtitle && <p className="text-zinc-300 text-xs">{subtitle}</p>}
        <p className="text-zinc-500 text-xs">
          {format(new Date(date), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
};

export default BubbleRow; 