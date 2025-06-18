import { ButtonHTMLAttributes, ReactNode } from "react";

export function GoldOutlineButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`border border-[#CFB53B] text-[#CFB53B] font-bold rounded-lg px-6 py-2 shadow hover:bg-[#CFB53B]/10 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 