import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

const colorClasses: Record<string, string> = {
  gold: "border-gold text-gold hover:bg-gold/10",
  zinc: "border-zinc-600 text-zinc-400 hover:bg-zinc-800/40",
};

export interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: 'gold' | 'zinc';
  className?: string;
}

export const OutlineButton = forwardRef<HTMLButtonElement, OutlineButtonProps>(
  ({ children, color = 'gold', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`font-bold rounded-lg px-6 py-2 shadow transition-colors border ${colorClasses[color] || colorClasses.gold} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

OutlineButton.displayName = "OutlineButton";

// Backward compatibility
export const GoldOutlineButton = OutlineButton; 