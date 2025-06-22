import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

export const GoldButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }
>(({ children, className = "", ...props }, ref) => {
  return (
    <button
      className={`bg-gold text-black font-bold rounded-lg px-6 py-2 shadow hover:bg-gold/80 transition-colors ${className}`}
      {...props}
      ref={ref}
    >
      {children}
    </button>
  );
});

GoldButton.displayName = "GoldButton"; 