import React from "react";
import clsx from "clsx";

type EntityButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: "gold" | "danger" | "archive" | "gray" | "custom";
  children: React.ReactNode;
  className?: string;
  variant?: "gold" | "danger";
};

const COLORS = {
  gold: {
    border: "border-[#C2B56B]",
    text: "text-[#C2B56B]",
    hover: "hover:bg-[#C2B56B]/10",
    focus: "focus:bg-[#C2B56B]/20",
  },
  danger: {
    border: "border-[#A22828]",
    text: "text-[#A22828]",
    hover: "hover:bg-[#A22828]/10",
    focus: "focus:bg-[#A22828]/20",
  },
  archive: {
    border: "border-gray-400",
    text: "text-gray-400",
    hover: "hover:bg-gray-400/10",
    focus: "focus:bg-gray-400/20",
  },
  gray: {
    border: "border-zinc-500",
    text: "text-zinc-300",
    hover: "hover:bg-zinc-700/20",
    focus: "focus:bg-zinc-700/30",
  },
  custom: {
    border: "border-blue-500",
    text: "text-blue-500",
    hover: "hover:bg-blue-500/10",
    focus: "focus:bg-blue-500/20",
  },
};

const EntityButton = React.forwardRef<HTMLButtonElement, EntityButtonProps>(
  ({ color = "gold", children, className = "", variant = "gold", ...props }, ref) => {
    const style = COLORS[color];
    const base =
      "px-3 py-1.5 rounded border-2 font-semibold bg-transparent transition text-sm shadow-none";
    const colorStyle = variant === "danger" ? COLORS.danger : style;

    return (
      <button
        ref={ref}
        className={clsx(
          base,
          colorStyle.border,
          colorStyle.text,
          colorStyle.hover,
          colorStyle.focus,
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