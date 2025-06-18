import { ButtonHTMLAttributes, ReactNode } from "react";

export function GoldButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`bg-[#CFB53B] text-black font-bold rounded-lg px-6 py-2 shadow hover:bg-[#BFA52B] transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 