import React from "react";
import clsx from "clsx";

type EntityButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "gold" | "danger" | "archive" | "gray" | "custom";
  children: React.ReactNode;
  className?: string;
};

const COLORS = {
  gold: {
    border: "border-[#FFD700]",
    text: "text-[#FFD700]",
    hover: "hover:bg-[#FFD700]/10",
  },
  danger: {
    border: "border-red-500",
    text: "text-red-500",
    hover: "hover:bg-red-500/10",
  },
  archive: {
    border: "border-zinc-500",
    text: "text-zinc-300",
    hover: "hover:bg-zinc-700/20",
  },
  gray: {
    border: "border-zinc-400",
    text: "text-zinc-400",
    hover: "hover:bg-zinc-800/20",
  },
  custom: {
    border: "",
    text: "",
    hover: "",
  },
};

const EntityButton = React.forwardRef<HTMLButtonElement, EntityButtonProps>(
  ({ color = "gold", children, className = "", ...props }, ref) => {
    const style = COLORS[color];
    return (
      <button
        ref={ref}
        className={clsx(
          "px-4 py-2 rounded border-2 font-bold bg-transparent transition",
          style.border,
          style.text,
          style.hover,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

EntityButton.displayName = "EntityButton";

export default EntityButton; 