import React from "react";
import clsx from "clsx";

type StatusBadgeVariant = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "neutral"
  | "pdp-active"
  | "pdp-inactive"
  | "archived"
  | "active"
  | "inactive";

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const VARIANTS = {
  // Standard semantic variants
  success: {
    bg: "bg-green-900/20",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: "text-green-400"
  },
  warning: {
    bg: "bg-yellow-900/20", 
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    icon: "text-yellow-400"
  },
  danger: {
    bg: "bg-red-900/20",
    border: "border-red-500/30", 
    text: "text-red-400",
    icon: "text-red-400"
  },
  info: {
    bg: "bg-blue-900/20",
    border: "border-blue-500/30",
    text: "text-blue-400", 
    icon: "text-blue-400"
  },
  neutral: {
    bg: "bg-zinc-900/20",
    border: "border-zinc-500/30",
    text: "text-zinc-400",
    icon: "text-zinc-400"
  },
  
  // PDP-specific variants (using brand colors)
  "pdp-active": {
    bg: "bg-[#C2B56B]/20",
    border: "border-[#C2B56B]/30", 
    text: "text-[#C2B56B]",
    icon: "text-[#C2B56B]"
  },
  "pdp-inactive": {
    bg: "bg-[#A22828]/20",
    border: "border-[#A22828]/30",
    text: "text-[#A22828]", 
    icon: "text-[#A22828]"
  },
  
  // Status variants
  archived: {
    bg: "bg-zinc-800/50",
    border: "border-zinc-600/30",
    text: "text-zinc-400",
    icon: "text-zinc-400"
  },
  active: {
    bg: "bg-green-900/20",
    border: "border-green-500/30", 
    text: "text-green-400",
    icon: "text-green-400"
  },
  inactive: {
    bg: "bg-red-900/20",
    border: "border-red-500/30",
    text: "text-red-400", 
    icon: "text-red-400"
  }
};

const SIZES = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm", 
  lg: "px-4 py-2 text-base"
};

export default function StatusBadge({
  variant,
  children,
  className = "",
  size = "md",
  showIcon = false
}: StatusBadgeProps) {
  const style = VARIANTS[variant];
  const sizeClass = SIZES[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded font-medium border",
        style.bg,
        style.border,
        style.text,
        sizeClass,
        className
      )}
    >
      {showIcon && (
        <span className={clsx("w-1.5 h-1.5 rounded-full", style.icon)} />
      )}
      {children}
    </span>
  );
}

// Convenience components for common use cases
export function PDPStatusBadge({ hasPDP, className }: { hasPDP: boolean; className?: string }) {
  return (
    <StatusBadge
      variant={hasPDP ? "pdp-active" : "pdp-inactive"}
      className={className}
    >
      {hasPDP ? "Active PDP" : "No PDP"}
    </StatusBadge>
  );
}

export function ArchivedBadge({ className }: { className?: string }) {
  return (
    <StatusBadge variant="archived" className={className}>
      Archived
    </StatusBadge>
  );
}

export function ActiveStatusBadge({ isActive, className }: { isActive: boolean; className?: string }) {
  return (
    <StatusBadge
      variant={isActive ? "active" : "inactive"}
      className={className}
    >
      {isActive ? "Active" : "Inactive"}
    </StatusBadge>
  );
}

export function ErrorBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <StatusBadge variant="danger" className={className}>
      {children}
    </StatusBadge>
  );
}

export function SuccessBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <StatusBadge variant="success" className={className}>
      {children}
    </StatusBadge>
  );
} 