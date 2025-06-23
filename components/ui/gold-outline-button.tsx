import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export const GoldOutlineButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }>(
  ({ children, className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`border border-gold text-gold font-bold rounded-lg px-6 py-2 shadow hover:bg-gold/10 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);

GoldOutlineButton.displayName = "GoldOutlineButton"; 